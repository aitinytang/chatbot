import pytesseract
from PIL import Image

image = Image.open('./assets/img/campaign/referral/step-2-p.png')

# Specify the Japanese language with lang='jpn'
text = pytesseract.image_to_string(image, lang='eng')

print(text)