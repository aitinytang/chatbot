import tiktoken

# Read the HTML file
with open('campaign-referral.html', 'r', encoding='utf-8') as file:
    html_content = file.read()

# Select the tokenizer for your model
encoder = tiktoken.encoding_for_model('gpt-4o')

# Encode the content into tokens
tokens = encoder.encode(html_content)

# Get the token count
token_count = len(tokens)

print(f'Total tokens: {token_count}')
