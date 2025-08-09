from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
import time
import logging
from datetime import date

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def book_flight(from_city: str, to_city: str, travel_date: str):
    try:
        # Set up ChromeDriver
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        wait = WebDriverWait(driver, 20)

        logger.info(f"Navigating to Travala.com for flight from {from_city} to {to_city} on {travel_date}")
        driver.get("https://www.travala.com")

        # Wait for and click the Flights tab
        logger.info("Switching to Flights tab")
        flights_tab = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Flights')]")))
        flights_tab.click()

        # Enter departure city
        logger.info(f"Entering departure city: {from_city}")
        departure_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='From']")))
        departure_input.clear()
        departure_input.send_keys(from_city)
        time.sleep(1)
        departure_input.send_keys(Keys.ENTER)

        # Enter destination city
        logger.info(f"Entering destination city: {to_city}")
        destination_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='To']")))
        destination_input.clear()
        destination_input.send_keys(to_city)
        time.sleep(1)
        destination_input.send_keys(Keys.ENTER)

        # Select travel date
        logger.info(f"Selecting travel date: {travel_date}")
        date_input = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@placeholder='Depart']")))
        date_input.click()
        date_input.clear()
        date_input.send_keys(travel_date.replace('-', '/'))  # Format as MM/DD/YYYY
        date_input.send_keys(Keys.ENTER)

        # Click Search Flights
        logger.info("Searching for flights")
        search_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Search Flights')]")))
        search_button.click()

        # Wait for search results and select cheapest flight
        logger.info("Selecting cheapest flight")
        cheapest_flight = wait.until(EC.element_to_be_clickable((By.XPATH, "//*[contains(@class, 'flight-card')]//button[contains(text(), 'Select')]")))
        cheapest_flight.click()

        # Enter passenger details
        logger.info("Entering passenger details")
        passenger_form = wait.until(EC.presence_of_element_located((By.XPATH, "//form[contains(@class, 'passenger-details')]")))
        first_name = passenger_form.find_element(By.XPATH, ".//input[@placeholder='First Name']")
        first_name.send_keys("John")
        last_name = passenger_form.find_element(By.XPATH, ".//input[@placeholder='Last Name']")
        last_name.send_keys("Doe")
        email = passenger_form.find_element(By.XPATH, ".//input[@placeholder='Email']")
        email.send_keys("john.doe@example.com")
        phone = passenger_form.find_element(By.XPATH, ".//input[@placeholder='Phone']")
        phone.send_keys("+919876543210")

        # Proceed to payment
        logger.info("Proceeding to payment")
        continue_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue to Payment')]")))
        continue_button.click()

        # Wait for payment page
        logger.info("Reached payment page")
        payment_option = wait.until(EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'Cryptocurrency')]")))
        logger.info("Cryptocurrency payment option found")

        # Prompt user for wallet connection
        wallet_connect = input("Do you want to connect your crypto wallet? (yes/no): ").strip().lower()
        if wallet_connect == "yes":
            logger.info("Simulating MetaMask wallet connection")
            print("MetaMask Wallet Connected (Dummy)")
        else:
            logger.info("User chose not to connect wallet")

        # Stop before payment submission
        logger.info("Stopping at payment step. No transaction processed.")

        # Keep browser open for 10 seconds
        time.sleep(10)

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise
    finally:
        driver.quit()
        logger.info("Browser closed")

if __name__ == "__main__":
    book_flight("Bangalore", "Mumbai", date.today().isoformat())