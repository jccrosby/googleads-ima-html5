// Copyright 2013 Google Inc. All Rights Reserved.
// You may study, modify, and use this example for any purpose.
// Note that this example is provided "as is", WITHOUT WARRANTY
// of any kind either expressed or implied.

var adsManager;
var adsLoader;
var adDisplayContainer;
var intervalTimer;
var requestAdsBtn;
var stopButton;
var videoContent;
var pod = 0;
var mridx = 1;

function init() {
  videoContent = document.getElementById('contentElement');
  requestAdsBtn = document.getElementById('requestAds');
  stopButton = document.getElementById('stopButton');
  requestAdsBtn.addEventListener('click', playAds);
  stopButton.addEventListener('click', stopAds);
  setUpIMA();
}

function setUpIMA() {
  // Create the ad display container.
  createAdDisplayContainer();
  // Create ads loader.
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  // Listen and respond to ads loaded and error events.
  adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false);
  adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false);

  // An event listener to tell the SDK that our content video
  // is completed so the SDK can play any post-roll ads.
  var contentEndedListener = function() {adsLoader.contentComplete();};
  videoContent.onended = contentEndedListener;

  adDisplayContainer.initialize();

}


function createAdDisplayContainer() {
  // We assume the adContainer is the DOM id of the element that will house
  // the ads.
  adDisplayContainer = new google.ima.AdDisplayContainer(
      document.getElementById('adContainer'), videoContent);
}

function playAds() {
  // Initialize the container. Must be done via a user action on mobile devices.
  //videoContent.load();

  try {

    // Request video ads.
    var adsRequest = new google.ima.AdsRequest();
    /* adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
        'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
        'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
        'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator='; */

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    adsRequest.linearAdSlotWidth = 640;
    adsRequest.linearAdSlotHeight = 400;

    adsRequest.nonLinearAdSlotWidth = 640;
    adsRequest.nonLinearAdSlotHeight = 150;

    pod++;
    mridx++;

    // Initialize the ads manager. Ad rules playlist will start at this time.
    // Call play to start showing the ad. Single video and overlay ads will
    // start at this time; the call will be ignored for ad rules.
    adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/live/ads?' +
    '&sz=1920x1080&iu=%2F2605%2Fqa_mlb.tv%2Fdesktop_live&gdfp_req=1&env=vp&' +
    'output=xml_vast3&unviewed_position_start=1' +
    '&url=https%3A%2F%2Fqa-aws.mlb.com%2Ftv%2Fg490149%2Fv1252107383%3Fsdkenv%3Dmock' +
    '%26disableMaxdate%3Dtrue%26debug%3Dtrue%23game%3D490149%2Ctfs%3D20170407_171000%2C' +
    'game_state%3Dpreview&description_url=mlb.tv&correlator=1926798333616904&pmnd=0' +
    '&pmxd=120000&pmad=-1&vpos=midroll&pp=mlbtv_csai_live&ad_rule=0&asset&cust_params' +
    '&cmsid=tbd&kuid=soksahz8o&ksg=r6cgifu96%2Crs81lgpbq%2Crujycglsz&vid=1252107383' +
    '&ppid=37066638&eid=634360200&sdkv=h.3.192.0&sdki=3c0d&scor=1016211052941933' +
    '&adk=3123136492&u_so=l&osd=2&frm=0&sdr=1&is_amp=0&afvsz=450x50%2C468x60%2C480x70' +
    '&ged=ve4_td4292_tt4174_pd4292_la3107000_er0.0.0.0_vi0.0.960.1119_vp0_ts190_eb16427' +
    '&pod=' + pod +
    '&mridx=' + mridx;

    adsLoader.requestAds(adsRequest);


  } catch (adError) {

    console.error('adError', adError);

  }
}

function stopAds() {
  // Initialize the container. Must be done via a user action on mobile devices.
  try {
    // Initialize the ads manager. Ad rules playlist will start at this time.
    adsManager.stop();
  } catch (adError) {
    // An error may be thrown if there was a problem with the VAST response.
    console.log('stop error', adError);
  }
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Get the ads manager.
  var adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  // videoContent should be set to the content video element.
  adsManager = adsManagerLoadedEvent.getAdsManager(videoContent, adsRenderingSettings);

  // Add listeners to the required events.
  adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      onAdEvent);

  // Listen to any additional events, if necessary.
  adsManager.addEventListener(
      google.ima.AdEvent.Type.LOADED,
      onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.STARTED,
      onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.COMPLETE,
      onAdEvent);


  adsManager.init(640, 360, google.ima.ViewMode.NORMAL);

  adsManager.start();
}

function onAdEvent(adEvent) {
  // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
  // don't have ad object associated.
  var ad = adEvent.getAd();
  switch (adEvent.type) {
    case google.ima.AdEvent.Type.LOADED:
      // This is the first event sent for an ad - it is possible to
      // determine whether the ad is a video ad or an overlay.
      if (!ad.isLinear()) {
        // Position AdDisplayContainer correctly for overlay.
        // Use ad.width and ad.height.
        videoContent.play();
      }
      break;
    case google.ima.AdEvent.Type.STARTED:
      // This event indicates the ad has started - the video player
      // can adjust the UI, for example display a pause button and
      // remaining time.
      if (ad.isLinear()) {
        // For a linear ad, a timer can be started to poll for
        // the remaining time.
        intervalTimer = setInterval(
            function() {
              var remainingTime = adsManager.getRemainingTime();
            },
            300); // every 300ms
      }
      break;
    case google.ima.AdEvent.Type.COMPLETE:
      // This event indicates the ad has finished - the video player
      // can perform appropriate UI actions, such as removing the timer for
      // remaining time detection.
      if (ad.isLinear()) {
        clearInterval(intervalTimer);
      }
      break;
  }
}

function onAdError(adErrorEvent) {
  // Handle the error logging.
  console.log(adErrorEvent.getError());
  adsManager.destroy();
}

function onContentPauseRequested() {
  videoContent.pause();
  // This function is where you should setup UI for showing ads (e.g.
  // display ad timer countdown, disable seeking etc.)
  // setupUIForAds();
}

function onContentResumeRequested() {
  videoContent.play();
  // This function is where you should ensure that your UI is ready
  // to play content. It is the responsibility of the Publisher to
  // implement this function when necessary.
  // setupUIForContent();

}

// Wire UI element references and UI event listeners.
init();
