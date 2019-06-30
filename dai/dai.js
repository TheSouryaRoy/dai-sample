/* Handle DAI video & add requests */

var BACKUP_STREAM =
    'http://storage.googleapis.com/testtopbox-public/video_content/bbb/' +
    'master.m3u8';

// Live stream asset key.
var TEST_ASSET_KEY = "sN_IYUG8STe1ZzhIIE_ksA";

// VOD content source and video IDs.
var TEST_CONTENT_SOURCE_ID = "19463";
var TEST_VIDEO_ID = "tears-of-steel";

// Variables to store video and ad information
var streamManager;   // used to request ad-enabled streams.
var hls = new Hls(); // hls.js video player
var videoElement;
var clickElement;

// Initialize StreamManager and request VOD stream
function initPlayer() {
  videoElement = document.getElementById('video');
  clickElement = document.getElementById('click');
  streamManager = new google.ima.dai.api.StreamManager(videoElement);
 
  streamManager.setClickElement(clickElement);
  streamManager.addEventListener(
    [google.ima.dai.api.StreamEvent.Type.LOADED,
     google.ima.dai.api.StreamEvent.Type.ERROR,
     google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED,
     google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED],
    onStreamEvent,
    false); // onStreamEvent handles events

  // Timed metadata is only used for LIVE streams.
  hls.on(Hls.Events.FRAG_PARSING_METADATA, function(event, data) {
    if (streamManager && data) {
      // For each ID3 tag in our metadata, we pass in the type - ID3, the
      // tag data (a byte array), and the presentation timestamp (PTS).
      data.samples.forEach(function(sample) {
        streamManager.processMetadata('ID3', sample.data, sample.pts);
      });
    }
  });

  requestVODStream(TEST_CONTENT_SOURCE_ID, TEST_VIDEO_ID, null);
  //requestLiveStream(TEST_ASSET_KEY, null);
}

// Request VOD stream
function requestVODStream(cmsId, videoId, apiKey) {
  var streamRequest = new google.ima.dai.api.VODStreamRequest();
  streamRequest.contentSourceId = cmsId;
  streamRequest.videoId = videoId;
  streamRequest.apiKey = apiKey;
  streamManager.requestStream(streamRequest);
}

// Request live video stream
function requestLiveStream(assetKey, apiKey) {
  var streamRequest = new google.ima.dai.api.LiveStreamRequest();
  streamRequest.assetKey = assetKey;
  streamRequest.apiKey = apiKey;
  streamManager.requestStream(streamRequest);
}

// Handle stream events
function onStreamEvent(e) {
  switch (e.type) {
    case google.ima.dai.api.StreamEvent.Type.LOADED:
      console.log('Stream loaded');
      loadUrl(e.getStreamData().url); //load video but don't auto play
      break;
    case google.ima.dai.api.StreamEvent.Type.ERROR:
      console.log('Error loading stream, playing backup stream.' + e);
      loadUrl(BACKUP_STREAM);
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
      console.log('Ad Break Started');
      videoElement.controls = false;
      clickElement.style.display = 'block';
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      console.log('Ad Break Ended');
      videoElement.controls = true;
      clickElement.style.display = 'none';
      break;
    default:
      break;
  }
}

// Handle video playback
function playVideo() {
  videoElement.play();
  console.log('Video playing');
}

// Load video without playing
// supports browsers that don't allow auto play
function loadUrl(url) {
  console.log('Loading:' + url);
  hls.loadSource(url);
  hls.attachMedia(videoElement);
  hls.on(Hls.Events.MANIFEST_PARSED, function() {
    console.log('Video ready to play');
    var play_button = document.getElementById("play-button");
    play_button.style.visibility = "visible";

  });
}