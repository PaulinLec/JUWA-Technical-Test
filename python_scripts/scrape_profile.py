import os
import time
import json
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Load environment variables from .env file
load_dotenv()

# Chrome Initialization
options = webdriver.ChromeOptions()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--log-level=3")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)


# Function to login to LinkedIn
def login_linkedin(email: str, password: str) -> None:
    driver.get("https://www.linkedin.com/login")

    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "username")))

    driver.find_element(By.ID, "username").send_keys(email)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.XPATH, "//button[@type='submit']").click()

    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "global-nav__me")))
    print("Logged in")


# Function to scrape profile data
def scrape_profile(profile_url: str) -> dict:
    driver.get(profile_url)
    time.sleep(5)  # Wait for full page load

    data = {}

    # Getting the name by trying different elements
    try:
        name_elem = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.ph5 h1")))
        data["name"] = name_elem.text.strip()
    except:
        try:
            alt_name = driver.find_element(By.XPATH, "//h1[contains(@class, 'text-heading')]").text.strip()
            if not data["name"]:
                data["name"] = alt_name
        except:
            pass
        data["name"] = None

    # Getting the headline
    try:
        data["headline"] = driver.find_element(By.CSS_SELECTOR, "div.text-body-medium.break-words").text.strip()
    except:
        data["headline"] = None

    # Getting the location
    try:
        data["location"] = driver.find_element(
            By.CSS_SELECTOR, "span.text-body-small.inline.t-black--light.break-words"
        ).text.strip()
    except:
        data["location"] = None

    # Getting the profile picture
    try:
        img = driver.find_element(By.CSS_SELECTOR, "img.pv-top-card-profile-picture__image--show")
        data["profile_picture"] = img.get_attribute("src")
    except:
        data["profile_picture"] = None

    # Getting the about section
    try:
        # First try to find the about section using the ID
        about_anchor = driver.find_element(By.ID, "about")

        # Then find the parent section element and get the text
        about_section = about_anchor.find_element(By.XPATH, "./ancestor::section")
        data["about"] = (
            about_section.find_element(By.CSS_SELECTOR, "div.inline-show-more-text--is-collapsed")
            .find_element(By.CSS_SELECTOR, "span")
            .text.strip()
        )
    except:
        data["about"] = None

    # Getting all the experiences of the user
    try:
        data["experiences"] = []

        # First try to find the experience section using the ID
        experience_anchor = driver.find_element(By.ID, "experience")

        # Then find the parent section element to get the list of jobs
        experience_section = experience_anchor.find_element(By.XPATH, "./ancestor::section")
        job_cards = experience_section.find_elements(By.CSS_SELECTOR, "li.artdeco-list__item")

        # For each job card, extract the relevant information
        for job in job_cards:
            try:
                # Find the title and company elements
                title_elem = job.find_element(By.CSS_SELECTOR, "span[aria-hidden='true']")
                company_elem = job.find_elements(By.CSS_SELECTOR, "span.t-14.t-normal")
                company_elem = (
                    company_elem[0].find_element(By.CSS_SELECTOR, "span[aria-hidden='true']")
                    if len(company_elem) > 0
                    else None
                )

                # Find the details elements (duration and location)
                details = job.find_elements(By.CSS_SELECTOR, "span.t-14.t-normal.t-black--light")
                duration_elem = (
                    details[0].find_element(By.CSS_SELECTOR, "span[aria-hidden='true']") if len(details) > 0 else None
                )
                location_elem = (
                    details[1].find_element(By.CSS_SELECTOR, "span[aria-hidden='true']") if len(details) > 1 else None
                )

                data["experiences"].append(
                    {
                        "title": title_elem.text.strip(),
                        "company": company_elem.text.strip(),
                        "duration": (duration_elem.text.strip() if duration_elem else None),
                        "location": (location_elem.text.strip() if location_elem else None),
                    }
                )
            except Exception as e:
                print("⚠️ Failed to parse one job:", e)
    except Exception as e:
        print("⚠️ Experience section not found:", e)

    return data


def main():
    # Load LinkedIn credentials from environment variables
    email = os.getenv("LINKEDIN_EMAIL")
    password = os.getenv("LINKEDIN_PASSWORD")
    linkedin_url = "https://www.linkedin.com/in/florian-minguet-326532233/"

    # Login to LinkedIn and scrape the profile
    login_linkedin(email, password)
    profile_data = scrape_profile(linkedin_url)

    # Save the profile data to a JSON file
    file_name = f"profile_data_{profile_data['name'].replace(' ', '_')}.json"
    with open(file_name, "w", encoding="utf-8") as f:
        json.dump(profile_data, f, ensure_ascii=False, indent=2)
    print(f"Profile data saved to {file_name}")

    driver.quit()


if __name__ == "__main__":
    main()
