from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
import time
import re
from groq import Groq  # pip install groq

 # Force ignore SSL errors in Selenium

from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_argument("--ignore-certificate-errors")
chrome_options.add_argument("--ignore-ssl-errors=yes")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-features=SSLKeyLogging")

# service = Service(executable_path=r'E:\chromedriver-win64\chromedriver.exe')
# driver = webdriver.Chrome(service=service, options=chrome_options)




# --- Setup ---
service = Service(executable_path=r"E:\chromedriver-win64\chromedriver.exe")
driver = webdriver.Chrome(service=service, options=chrome_options)
wait = WebDriverWait(driver, 15)

driver.get("https://www.travala.com/?tab=flights")
time.sleep(5)

# --- Flights tab ---
try:
    flights_tab = wait.until(EC.element_to_be_clickable(
        (By.XPATH, '//button[contains(.,"Flights")]')
    ))
    flights_tab.click()
except Exception as e:
    print("Could not click Flights tab:", e)


# --- One Way ---
try:
    # Select the radio input for One Way
    one_way_radio = wait.until(EC.element_to_be_clickable(
        (By.XPATH, '//input[@type="radio" and @value="oneway"]')
    ))
    driver.execute_script("arguments[0].click();", one_way_radio)
    print("One way selected.")
except Exception as e:
    print("Could not select One way:", e)


# # --- One Way ---
# try:
#     one_way = wait.until(EC.element_to_be_clickable(
#         (By.XPATH, '//label[contains(.,"One way")]')
#     ))
#     one_way.click()
# except Exception as e:
#     print("Could not select One way:", e)

# --- From: Mangalore ---
try:
    from_box = wait.until(EC.element_to_be_clickable(
        (By.XPATH, '//input[contains(@placeholder,"From")]')
    ))
    from_box.clear()
    from_box.send_keys("Mangalore")
    time.sleep(2)
    from_box.send_keys(Keys.DOWN, Keys.ENTER)
except Exception as e:
    print("Could not enter From location:", e)

# --- To: New Delhi ---
try:
    to_box = wait.until(EC.element_to_be_clickable(
        (By.XPATH, '//input[contains(@placeholder,"To")]')
    ))
    to_box.clear()
    to_box.send_keys("New Delhi")
    time.sleep(2)
    to_box.send_keys(Keys.DOWN, Keys.ENTER)
except Exception as e:
    print("Could not enter To location:", e)

# --- Date: 10 Sep 2025 ---
try:
    date_input = wait.until(EC.element_to_be_clickable(
        (By.XPATH, '//input[contains(@placeholder,"Date")]')
    ))
    date_input.click()
    # Choose day "10" from the calendar
    day_10 = wait.until(EC.element_to_be_clickable(
        (By.XPATH, '//div[contains(@class,"DayPicker")]//div[text()="10"]')
    ))
    day_10.click()
except Exception as e:
    print("Could not select date:", e)

# --- Passengers ---
try:
    pax_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, '//input[contains(@placeholder,"Passenger")] | //button[contains(.,"Passenger")]')
    ))
    pax_btn.click()
    # Confirm (usually default is 1 Economy)
    done_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, '//button[contains(.,"Done")] | //button[contains(.,"Apply")]')
    ))
    done_btn.click()
except Exception as e:
    print("Could not select passengers:", e)

# --- Search ---
try:
    search_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, '//button[contains(.,"Search")]')
    ))
    search_btn.click()
except Exception as e:
    print("Could not click Search:", e)

time.sleep(10)  # wait for results

# --- Scrape flight results ---
flights = driver.find_elements(By.CSS_SELECTOR, '[class*="flight"], [class*="result"]')
flight_data = []

for i, flight in enumerate(flights):
    try:
        price_text = flight.find_element(By.CSS_SELECTOR, '[class*="price"]').text
        duration_text = flight.find_element(By.CSS_SELECTOR, '[class*="duration"]').text

        price = float(re.sub(r"[^\d.]", "", price_text))
        hrs = re.search(r"(\d+)h", duration_text)
        mins = re.search(r"(\d+)m", duration_text)
        duration_min = (int(hrs.group(1)) if hrs else 0) * 60 + (int(mins.group(1)) if mins else 0)

        flight_data.append({"index": i, "price": price, "duration": duration_min, "element": flight})
    except:
        continue

if not flight_data:
    print("No flights found. Adjust selectors.")
    driver.quit()
    exit()

# --- Use Groq API for best flight selection ---
api_key = input("Enter your Groq API key: ")
client = Groq(api_key="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")

prompt = f"Flights: {flight_data}. Pick the index with lowest price; break ties with shortest duration. Return only the index number."

response = client.chat.completions.create(
    messages=[{"role": "user", "content": prompt}],
    model="llama-3.1-8b-instant",
)

selected_index = int(response.choices[0].message.content.strip())
selected_flight = flight_data[selected_index]["element"]

# --- Book button ---
try:
    book_btn = selected_flight.find_element(By.XPATH, './/button[contains(.,"Book")]')
    book_btn.click()
except Exception as e:
    print("Could not click Book button:", e)

# --- Pause at payment ---
input("At payment page. Complete manually, then press Enter to quit.")
driver.quit()