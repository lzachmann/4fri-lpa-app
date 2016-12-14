#!/usr/bin/env python
"""Required credentials configuration."""

# The service account email address authorized by your Google contact.
# The process to set up a service account is described in the README.
EE_ACCOUNT = '199148915744-j9j6sfcsgmedrr7oev6ffn9t2b5m69tm@developer.gserviceaccount.com'
# The private key associated with your service account in Privacy Enhanced
# Email format (.pem suffix).  To convert a private key from the RSA format
# (.p12 suffix) to .pem, run the openssl command like this:
# openssl pkcs12 -in downloaded-privatekey.p12 -nodes -nocerts > privatekey.pem
# You can find more detailed instructions in the README.
EE_PRIVATE_KEY_FILE = 'privatekey.pem'

MAPS_KEY_FILE = 'mapskey.txt'
