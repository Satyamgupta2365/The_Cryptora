import time

# Dummy wallet addresses (not real keys)
hedera_wallet = "0.0.6494384"
metamask_wallet = "0x5AB2d2ff316936d31DDFEf581672365f680A986A"

def simulate_transfer(amount_hbar, from_wallet, to_wallet):
    print(f"\n🚀 Simulating transfer of {amount_hbar} ℏ")
    print(f"From Hedera Wallet: {from_wallet}")
    print(f"To MetaMask Wallet (Ethereum): {to_wallet}")
    
    time.sleep(1)  # simulate processing delay

    # Simulation logic
    if from_wallet.startswith("0.0.") and to_wallet.startswith("0x"):
        print("✅ Transfer simulated successfully.")
        return {
            "status": "success",
            "from": from_wallet,
            "to": to_wallet,
            "amount": amount_hbar,
            "message": "Simulation complete. This is NOT a real transfer."
        }
    else:
        print("❌ Transfer failed: Invalid wallet format.")
        return {
            "status": "error",
            "message": "Invalid wallet format"
        }

# Simulate a dummy transfer
result = simulate_transfer(10.5, hedera_wallet, metamask_wallet)

# Print result
print("\nResult:", result)
