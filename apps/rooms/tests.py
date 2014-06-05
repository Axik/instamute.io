from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains

from django.test import LiveServerTestCase
from .models import Room


profile = webdriver.FirefoxProfile()
profile.set_preference ('media.navigator.permission.disabled', True)
profile.update_preferences()


class BddVoiceAppInFirefox(LiveServerTestCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.driver = webdriver.Firefox(firefox_profile=profile)

    def test_room_creation(self):
        driver = self.driver
        driver.get(self.live_server_url)
        self.assertIn("None And Void", driver.title)

        submit_button = driver.find_element_by_name("submit")

        actions = ActionChains(driver)
        actions.move_to_element(submit_button)
        actions.click(submit_button)
        actions.perform()

        self.assertIn("None And Void", driver.title)

    def test_join_the_room(self):
        room = Room.objects.create()
        driver = self.driver
        driver.get("{}/rooms/{}".format(self.live_server_url, room.shorten_url))

        self.assertIn("None And Void", driver.title)

    @classmethod
    def tearDownClass(cls):
        cls.driver.close()
        super().tearDownClass()
