#!/usr/bin/env python
"""Web server for the Trendy Lights application.

The overall architecture looks like:

               server.py         script.js
 ______       ____________       _________
|      |     |            |     |         |
|  EE  | <-> | App Engine | <-> | Browser |
|______|     |____________|     |_________|
     \                               /
      '- - - - - - - - - - - - - - -'

The code in this file runs on App Engine. It's called when the user loads the
web page and when details about a polygon are requested.

Our App Engine code does most of the communication with EE. It uses the
EE Python library and the service account specified in config.py. The
exception is that when the browser loads map tiles it talks directly with EE.

The basic flows are:

When the user first loads the application in their browser, their request is
routed to the get() function in the MainHandler class by the framework we're
using, webapp2.

Note: memcache, the cache we are using, is a service provided by App Engine
that temporarily stores small values in memory. Using it allows us to avoid
needlessly requesting the same data from Earth Engine over and over again,
which in turn helps us avoid exceeding our quota and respond to user
requests more quickly.

"""

import json
import os

import config
import ee
import jinja2
import webapp2

from google.appengine.api import memcache


###############################################################################
#                             Web request handlers.                           #
###############################################################################


class MainHandler(webapp2.RequestHandler):
  """A servlet to handle requests to load the main Trendy Lights web page."""

  def get(self, path=''):
    """Returns the main web page, populated with EE map and polygon info."""
    ids = GetMapIds()
    template = JINJA2_ENVIRONMENT.get_template('index.html')
    template_values = {
            'ids': json.dumps(ids),
            'maps_key': MAPS_KEY
            }
    self.response.out.write(template.render(template_values))


# Define webapp2 routing from URL paths to web request handlers. See:
# http://webapp-improved.appspot.com/tutorials/quickstart.html
app = webapp2.WSGIApplication([
    ('/', MainHandler),
])


###############################################################################
#                                   Helpers.                                  #
###############################################################################


def GetMapIds():
    imagery = ee.ImageCollection(IMAGE_COLLECTION_ID)
    classification = ee.ImageCollection(CLASSIFICATION_IMAGE_COLLECTION_ID)
    lpis = ee.ImageCollection(LPIS_COLLECTION_ID)
    aoi = ee.FeatureCollection(AOI_FEATURE_COLLECTION_ID)
    # cc_summary = ee.ImageCollection(CC_IMAGE_COLLECTION_ID)
    # cc_summary_1 = ee.Image(cc_summary.filter(ee.Filter.eq('acres', 1)).first())


    def get_image_mask(image):
        band_sum = image.reduce(ee.Reducer.sum())
        return band_sum.mask(band_sum).mask()
    def mask_image(image):
        image_mask = get_image_mask(image)
        return image.mask(image_mask)
    def clip_image(image):
        return image.clip(aoi.geometry())
    def clip_and_mask(image):
      return clip_image(mask_image(image))
    def image_to_geom(image):
      return ee.Feature(image.geometry())

    # footprint = classification.map(image_to_geom)
    # filtered_collection = imagery.filterBounds(footprint.geometry())
    rgb_map_id = imagery.map(clip_and_mask).getMapId({
        'bands': 'b1,b2,b3',
    })
    rgb_map = {'map_id': rgb_map_id['mapid'],
               'token': rgb_map_id['token'],
               'name': 'True-color imagery',
               'alt': 'rgb'}

    classification_map_id = classification.map(clip_image).getMapId({
        'bands': 'classification',
        'palette': '238b45,252525,d9f0a3',  # canopy, shadow, other
        'min': 0, 'max': 2,
    })
    classification_map = {'map_id': classification_map_id['mapid'],
                          'token': classification_map_id['token'],
                          'name': 'Classification',
                          'alt': 'classification'}

    def lpis_mask_image(image):
        return clip_image(image.mask(image.neq(-1.7e+308)))
    lpis = lpis.filter(ee.Filter.eq('scale', 1)).map(lpis_mask_image)

    area_mn_id = lpis.select(['AREA_MN']).getMapId({
        'palette': REDS, 'min': 59.43, 'max': 1341.44})
    area_mn_map = { 'map_id': area_mn_id['mapid'],
                    'token': area_mn_id['token'],
                    'name': 'Mean patch area',
                    'alt': 'frag_set_1' }  #area_mn

    ai_id = lpis.select(['AI']).getMapId({
        'palette': BLUES, 'min': 71.25, 'max': 99.23})
    ai_map = { 'map_id': ai_id['mapid'],
                    'token': ai_id['token'],
                    'name': 'Aggregation index',
                    'alt': 'frag_set_2' }  #ai

    enn_mn_id = lpis.select(['ENN_MN']).getMapId({
        'palette': GREENS, 'min': 1.38, 'max': 15.75})
    enn_mn_map = { 'map_id': enn_mn_id['mapid'],
                    'token': enn_mn_id['token'],
                    'name': 'Mean nearest neighbor distance',
                    'alt': 'frag_set_3' }  #enn_mn

    shape_mn_id = lpis.select(['SHAPE_MN']).getMapId({
        'palette': PURPLES, 'min': 1.13, 'max': 1.71})
    shape_mn_map = { 'map_id': shape_mn_id['mapid'],
                    'token': shape_mn_id['token'],
                    'name': 'Mean shape index',
                    'alt': 'frag_set_4' }  #shape_mn

    frac_mn_id = lpis.select(['FRAC_MN']).getMapId({
        'palette': PURPLES, 'min': 1.08, 'max': 1.23})
    frac_mn_map = { 'map_id': frac_mn_id['mapid'],
                    'token': frac_mn_id['token'],
                    'name': 'Mean fractal dimension index',
                    'alt': 'frag_set_4' }  #frac_mn

    frac_am_id = lpis.select(['FRAC_AM']).getMapId({
        'palette': PURPLES, 'min': 0.84, 'max': 1.56})
    frac_am_map = { 'map_id': frac_am_id['mapid'],
                    'token': frac_am_id['token'],
                    'name': 'Area-weighted mean fractal dimension index',
                    'alt': 'frag_set_4' }  #frac_am

    frac_cv_id = lpis.select(['FRAC_CV']).getMapId({
        'palette': PURPLES, 'min': 0.013, 'max': 0.098})
    frac_cv_map = { 'map_id': frac_cv_id['mapid'],
                    'token': frac_cv_id['token'],
                    'name': 'Fractal dimension index, coefficient of variation',
                    'alt': 'frag_set_4' }  #frac_cv

    enn_cv_id = lpis.select(['ENN_CV']).getMapId({
        'palette': ORANGES, 'min': 0.49, 'max': 1.15})
    enn_cv_map = { 'map_id': enn_cv_id['mapid'],
                    'token': enn_cv_id['token'],
                    'name': 'Nearest neighbor distance, coefficient of variation',
                    'alt': 'frag_set_5' }  #enn_cv

    lpi_id = lpis.select(['LPI']).getMapId({
        'palette': BROWNS, 'min': 0.11, 'max': 1.66})
    lpi_map = { 'map_id': lpi_id['mapid'],
                    'token': lpi_id['token'],
                    'name': 'Largest patch index',
                    'alt': 'frag_set_6' }  #lpi

    area_am_id = lpis.select(['AREA_AM']).getMapId({
        'palette': BROWNS, 'min': -90.4, 'max': 7519})
    area_am_map = { 'map_id': area_am_id['mapid'],
                    'token': area_am_id['token'],
                    'name': 'Area-weighted mean patch area',
                    'alt': 'frag_set_6' }  #area_am

    core_am_id = lpis.select(['CORE_AM']).getMapId({
        'palette': BROWNS, 'min': -21.2, 'max': 6624})
    core_am_map = { 'map_id': core_am_id['mapid'],
                    'token': core_am_id['token'],
                    'name': 'Area-weighted mean core area index',
                    'alt': 'frag_set_6' }  #core_am

    gyrate_am_id = lpis.select(['GYRATE_AM']).getMapId({
        'palette': BLACKS, 'min': 1.89, 'max': 43.12})
    gyrate_am_map = { 'map_id': gyrate_am_id['mapid'],
                    'token': gyrate_am_id['token'],
                    'name': 'Area-weighted mean radius of gyration',
                    'alt': 'frag_set_7' }  #gyrate_am

    shape_am_id = lpis.select(['SHAPE_AM']).getMapId({
        'palette': BLACKS, 'min': 0.96, 'max': 14.19})
    shape_am_map = { 'map_id': shape_am_id['mapid'],
                    'token': shape_am_id['token'],
                    'name': 'Area-weighted mean shape index',
                    'alt': 'shape_am' }  #shape_am

    return [rgb_map, classification_map, area_mn_map, ai_map, enn_mn_map,
        shape_mn_map, frac_mn_map, frac_am_map, frac_cv_map, enn_cv_map,
        lpi_map, area_am_map, core_am_map, gyrate_am_map, shape_am_map]


###############################################################################
#                                   Constants.                                #
###############################################################################


# Memcache is used to avoid exceeding our EE quota. Entries in the cache expire
# 24 hours after they are added. See:
# https://cloud.google.com/appengine/docs/python/memcache/
MEMCACHE_EXPIRATION = 60 * 60 * 24

IMAGE_COLLECTION_ID = 'users/LZachmann/USFS_R3_AP'
CLASSIFICATION_IMAGE_COLLECTION_ID = 'users/LZachmann/4FRI_RF_CCC_V2'
# CC_IMAGE_COLLECTION_ID = 'users/LZachmann/4FRI_CC_SUMMARIES'
LPIS_COLLECTION_ID = 'users/LZachmann/4FRI_LPIS_CALIBRATED'

AOI_FEATURE_COLLECTION_ID = 'ft:1ZV7eVRAvfb7Cb6UY-FZ_lw9Dp942eVvdKsv5r0VD'

# INFERNO = "000004,56106E,BB3754,F98C0A,FCFFA4"
REDS = "FFFFCC, F8C5A0, F18C74, EA5348, E41A1C"
BLUES = "FFFFCC, CDDEC7, 9BBEC2, 699EBD, 377EB8"
GREENS = "FFFFCC, D2EBAB, A5D78B, 79C36A, 4DAF4A"
PURPLES = "FFFFCC, E5D2C1, CBA6B7, B17AAD, 984EA3"
ORANGES = "FFFFCC, FFDF99, FFBF66, FF9F33, FF7F00"
BROWNS = "FFFFCC, E8D4A3, D2AA7A, BC8051, A65628"
BLACKS = "FFFFCC, C8C8A2, 929278, 5B5B4E, 252525"


###############################################################################
#                               Initialization.                               #
###############################################################################

# Load Google Maps api Key
key_file = open(config.MAPS_KEY_FILE)
MAPS_KEY = key_file.readline().rstrip()

# Use our App Engine service account's credentials.
EE_CREDENTIALS = ee.ServiceAccountCredentials(
    config.EE_ACCOUNT, config.EE_PRIVATE_KEY_FILE)
# Create the Jinja templating system we use to dynamically generate HTML. See:
# http://jinja.pocoo.org/docs/dev/
JINJA2_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    autoescape=True,
    extensions=['jinja2.ext.autoescape'])

# Initialize the EE API.
ee.Initialize(EE_CREDENTIALS)
