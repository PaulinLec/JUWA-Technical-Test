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
from selenium.webdriver.remote.webelement import WebElement

# Load environment variables from .env file
load_dotenv()


# LinkedIn Scraper Class
# This class is responsible for scraping LinkedIn profiles using Selenium WebDriver.
class LinkedInScraper:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password

        # Chrome Initialization
        options = webdriver.ChromeOptions()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--log-level=3")
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    # Function to login to LinkedIn
    def login(self) -> None:
        self.driver.get("https://www.linkedin.com/login")

        WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.ID, "username")))

        self.driver.find_element(By.ID, "username").send_keys(self.email)
        self.driver.find_element(By.ID, "password").send_keys(self.password)
        self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

        WebDriverWait(self.driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, "global-nav__me")))

    # Function to quit the driver
    def quit(self) -> None:
        self.driver.quit()

    # Function to scrape profile data
    def scrape_profile(self, profile_url: str) -> dict:
        self.driver.get(profile_url)
        time.sleep(5)  # Wait for full page load

        data = {}

        # Getting the name by trying different elements
        try:
            name_elem = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.ph5 h1"))
            )
            data["name"] = name_elem.text.strip()
        except:
            try:
                alt_name = self.driver.find_element(By.XPATH, "//h1[contains(@class, 'text-heading')]").text.strip()
                if not data["name"]:
                    data["name"] = alt_name
            except:
                pass
            data["name"] = None

        # Getting the headline
        try:
            data["headline"] = self.driver.find_element(
                By.CSS_SELECTOR, "div.text-body-medium.break-words"
            ).text.strip()
        except:
            data["headline"] = None

        # Getting the location
        try:
            data["location"] = self.driver.find_element(
                By.CSS_SELECTOR, "span.text-body-small.inline.t-black--light.break-words"
            ).text.strip()
        except:
            data["location"] = None

        # Getting the profile picture
        try:
            img = self.driver.find_element(By.CSS_SELECTOR, "img.pv-top-card-profile-picture__image--show")
            data["profile_picture"] = img.get_attribute("src")
        except:
            data["profile_picture"] = None

        # Getting the about section
        try:
            # First try to find the about section using the ID
            about_anchor = self.driver.find_element(By.ID, "about")

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
            data["experiences"] = self.__get_experiences()
        except Exception as e:
            data["experiences"] = None

        return data

    def __get_experiences(self) -> list:
        experiences = []

        # First try to find the experience section using the ID
        experience_anchor = self.driver.find_element(By.ID, "experience")

        # Then find the parent section element to get the list of jobs
        experience_section = experience_anchor.find_element(By.XPATH, "./ancestor::section")
        job_cards = experience_section.find_elements(By.CSS_SELECTOR, "li.artdeco-list__item")

        # Helper function to get the text from a span element with a specific CSS selector
        def get_text_from_span(driver: WebElement, css_selector: str, index: int = 0) -> str | None:
            try:
                elem = driver.find_elements(By.CSS_SELECTOR, css_selector)
                return (
                    elem[index].find_element(By.CSS_SELECTOR, "span[aria-hidden='true']").text.strip()
                    if len(elem) > index
                    else None
                )
            except:
                return None

        # For each job card, extract the relevant information
        for job in job_cards:
            try:
                # Find the title
                title_elem = job.find_element(By.CSS_SELECTOR, "span[aria-hidden='true']").text.strip()

                # Find the details elements
                company_elem = get_text_from_span(job, "span.t-14.t-normal")
                duration_elem = get_text_from_span(job, "span.t-14.t-normal.t-black--light", index=0)
                location_elem = get_text_from_span(job, "span.t-14.t-normal.t-black--light", index=1)

                experiences.append(
                    {
                        "title": title_elem,
                        "company": company_elem,
                        "duration": duration_elem,
                        "location": location_elem,
                    }
                )
            except Exception as e:
                print(f"Error extracting job data: {e}")
                continue

        return experiences


def main():
    # Load LinkedIn credentials from environment variables
    email = os.getenv("LINKEDIN_EMAIL")
    password = os.getenv("LINKEDIN_PASSWORD")
    linkedin_url = "https://www.linkedin.com/in/florian-minguet-326532233/"

    # Initialize the LinkedIn scraper and login
    try:
        if not email or not password:
            raise ValueError("LinkedIn credentials are not set in the environment variables.")

        scraper = LinkedInScraper(email, password)
        scraper.login()
        print("Logged in")
    except Exception:
        print(f"Error during login")
        return

    # Scrape the profile data
    profile_data = scraper.scrape_profile(linkedin_url)

    # Save the profile data to a JSON file
    file_name = f"profile_data_{profile_data['name'].replace(' ', '_')}.json"
    with open(file_name, "w", encoding="utf-8") as f:
        json.dump(profile_data, f, ensure_ascii=False, indent=2)
    print(f"Profile data saved to {file_name}")

    scraper.quit()


if __name__ == "__main__":
    main()
