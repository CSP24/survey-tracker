const Animation = require('Animation');
const CameraInfo = require('CameraInfo');
const Materials = require('Materials');
const Diagnostics = require('Diagnostics');
const NativeUI = require('NativeUI');
const Patches = require('Patches');
const Reactive = require('Reactive');
const Scene = require('Scene');
const Shaders = require('Shaders');
const Textures = require('Textures');
const Time = require('Time');
const TouchGestures = require('TouchGestures');

import brands from './brands';

let editableRating = false;
let currentRating = 0;
let currentBrand = null;

const canvas = Scene.root.find('canvas');
const container = canvas.child('container');
const container2 = canvas.child('other container');
Patches.setStringValue('size1', canvas.width.toString());
Patches.setStringValue('size2', canvas.height.toString());
Patches.setStringValue('size3', Patches.getPoint2DValue('ds').x.toString());
Patches.setStringValue('size4', Patches.getPoint2DValue('ds').y.toString());

container.transform.scaleX = Reactive.max(Reactive.val(1), Reactive.div(Patches.getPoint2DValue('ds').x, canvas.width));
container.transform.scaleY = Reactive.max(Reactive.val(1), Reactive.div(Patches.getPoint2DValue('ds').y, canvas.height));
// container.transform.scaleX = Reactive.div(Patches.getPoint2DValue('ds').x, canvas.width);
// container.transform.scaleY = Reactive.div(Patches.getPoint2DValue('ds').y, canvas.height);

const ratingTextRect = container.child('star rating rectangle');
const ratingText = container.child('star rating text');
const rateText = container.child('rate text');
const glow = container2.child('glow');
const sequence = container2.child('sequence');
const coupon = container.child('coupon');
const backDuplicate = container.child('back duplicate');
const frontDuplicate = container.child('front duplicate');
const backOverlay = container.child('back overlay');
const frontOverlay = container.child('front overlay');

let activeStarTexture = 'star active';
let inactiveStarTexture = 'star inactive';

const activeStarMat = Materials.get('active star mat');
const inactiveStarMat = Materials.get('inactive star mat');

const defaultActiveStarTexture = Textures.get('star active');
const defaultInactiveStarTexture = Textures.get('star inactive');

const couponMat = Materials.get('coupon mat');
const couponX_visible = 26.44618;
const couponX_hidden = 358.03207;
const fadeDuration = 1200;
const defaultScale = 1;
const defaultPos = 0;

const stars = [];

const picker = NativeUI.picker;

let couponTapSubscription = null;
let pickerSubscription = null;

let fadeDetectTimeout = null;
let detectSequenceTimout = null;
let glowDelayTimout = null;

function setEffectRating(visible, conf) {
  if (visible && conf) {
    if (conf.specialMat) {
      ratingTextRect.material = Materials.get(conf.specialMat);
      ratingTextRect.transform.scaleX = conf.rateScale || 1;
      ratingTextRect.transform.scaleY = conf.rateScale || 1;
      ratingTextRect.transform.x = conf.ratePosX || 0;
      ratingTextRect.transform.y = conf.ratePosY || 0;

      ratingText.hidden = true;
      ratingTextRect.hidden = false;
    } else if (conf.textureSequence) {
      ratingTextRect.material = Materials.get('rate rect mat');
      ratingTextRect.material.diffuse = Textures.get(conf.textureSequence);
      ratingTextRect.material.diffuse.currentFrame = currentRating - 1;
      ratingTextRect.transform.scaleX = conf.rateScale || 1;
      ratingTextRect.transform.scaleY = conf.rateScale || 1;
      ratingTextRect.transform.x = conf.ratePosX || 0;
      ratingTextRect.transform.y = conf.ratePosY || 0;

      ratingText.hidden = true;
      ratingTextRect.hidden = false;
    }
    else {
      ratingText.text = Reactive.val(`${currentRating}.0/5.0`);

      ratingText.hidden = false;
      ratingTextRect.hidden = true;
    }
  } else {
    ratingTextRect.hidden = true;
    ratingText.hidden = true;
  }
}

const starContainer = container.child('star container');
for (let i = 1; i <= 5; i += 1) {
  const star  = container.child(`star ${i}`);
  star.material = inactiveStarMat;
  star.transform.x = 47.5 * (i - 3);
  star.transform.y = 216.27698;
  TouchGestures.onTap(star).subscribe(() => {
    setRating(i, true);
  });
  stars.push(star);
}

function clearSparkTimeout (subscription) {
  if (subscription) {
    Time.clearTimeout(subscription);
  }
  return null;
}

function setRating(rating, final) {
  if (!editableRating) return;
  currentRating = rating;
  Patches.setScalarValue('currentRating', Reactive.val(currentRating));
  stars.map((star, index) => {
    star.material = (index < currentRating) ?
      activeStarMat :
      inactiveStarMat;
    star.hidden = false;
  });
  if (final) {
    editableRating = false;
    setTextVisibility(false);
    setCouponVisiblity(true);
  }
}

function setStarConfig(hidden, config) {
  let dx = 47.5;
  let ix = 0;
  let ox = - 2;

  let dy = 0;
  let iy = 216.27698;
  let oy = 0;

  let s = 0.75;

  if (config) {
    dx = config.dx === undefined? dx : config.dx;
    ix = config.ix === undefined? ix : config.ix;
    ox = config.ox === undefined? ox : config.ox;
    dy = config.dy === undefined? dy : config.dy;
    iy = config.iy === undefined? iy : config.iy;
    oy = config.oy === undefined? oy : config.oy;
    s = config.s === undefined? s : config.s;
    activeStarTexture = config.activeStar || null;
    inactiveStarTexture = config.inactiveStar || null;
    if (activeStarTexture) activeStarMat.diffuse = Textures.get(activeStarTexture);
    if (inactiveStarTexture) inactiveStarMat.diffuse = Textures.get(inactiveStarTexture);
  } else {
    activeStarTexture = 'star active';
    inactiveStarTexture = 'star inactive';
    activeStarMat.diffuse = defaultActiveStarTexture;
    inactiveStarMat.diffuse = defaultInactiveStarTexture;
  }
  stars.forEach((star, index) => {
    star.transform.scaleX = s;
    star.transform.scaleY = s;
    star.transform.x = dx * (index + ox) + ix;
    star.transform.y = dy * (index + oy) + iy;
    if (hidden) {
      star.hidden = hidden;
    } else {
      if (index < currentRating) {
        if (activeStarTexture === null) {
          star.hidden = true;
        } else {
          star.hidden = false;
        }
      } else {
        if (inactiveStarTexture === null) {
          star.hidden = true;
        } else {
          star.hidden = false;
        }
      }
    }
  });
}

function setTextVisibility(visible) {
  rateText.hidden = !visible;
}

function setRaterVisibility(visible) {
  if (visible) {
    editableRating = true;
    setRating(0, false);
  } else {
    editableRating = false;
  }
}
function setCouponVisiblity(visible, skipAnimation, couponTexture) {
  if (couponTexture) {
    couponMat.diffuse = Textures.get(couponTexture);
  }
  if (visible) {
    const td = Animation.timeDriver({
      durationMilliseconds: 300,
      loopCount: 1,
      mirror: false,
    });
    coupon.transform.x = Animation.animate(td, Animation.samplers.easeInOutSine(couponX_hidden, couponX_visible));
    coupon.hidden = false;
    td.start();

    couponTapSubscription = TouchGestures.onTap(coupon).subscribe(() => {
      setCouponVisiblity(false);
    });
  } else {
    if (couponTapSubscription) {
      couponTapSubscription.unsubscribe();
      couponTapSubscription = null;
    }
    if (skipAnimation) {
      coupon.transform.x = couponX_hidden;
    } else {
      const td = Animation.timeDriver({
        durationMilliseconds: 300,
        loopCount: 1,
        mirror: false,
      });
      coupon.transform.x = Animation.animate(td, Animation.samplers.easeInOutSine(couponX_visible, couponX_hidden));
      td.start();
      showFilters();
    }
  }
}

function loadEffect({newValue: val}) {
  const backTrans = backDuplicate.transform;
  const frontTrans = frontDuplicate.transform;
  if (val === 0) {
    starContainer.hidden = false;
    setStarConfig(false);

    backDuplicate.material = Materials.get('back dup mat');
    backTrans.scaleX = defaultScale;
    backTrans.scaleY = defaultScale;
    backTrans.x = defaultPos;
    backTrans.y = defaultPos;

    backOverlay.hidden = true;

    frontDuplicate.hidden = true;

    frontOverlay.hidden = true;

    setEffectRating(false);
  } else {
    starContainer.hidden = true;
    setStarConfig(true);
    const conf = brands[currentBrand].effects[val - 1];
    if (conf.specialMat) {
      backDuplicate.material = Materials.get(conf.specialMat);
      backDuplicate.hidden = false;
      backOverlay.hidden = true;
      frontDuplicate.hidden = true;
      frontOverlay.hidden = true;
    } else {
      backDuplicate.material = Materials.get('back dup mat');
      if (conf.backPos) {
        backDuplicate.hidden = false;
        backTrans.x = conf.backPos[0];
        backTrans.y = conf.backPos[1];
        if (conf.backScale) {
          backTrans.scaleX = conf.backScale[0];
          backTrans.scaleY = conf.backScale[1];
        } else {
          backTrans.scaleX = defaultScale;
          backTrans.scaleY = defaultScale;
        }
      } else {
        backDuplicate.hidden = true;
      }

      if (conf.backOverlay) {
        backOverlay.material = Materials.get('back overlay mat');
        backOverlay.material.diffuse = Textures.get(conf.backOverlay);
        backOverlay.hidden = false;
      } else if (conf.backOverlayMat) {
        backOverlay.material = Materials.get(conf.backOverlayMat);
        backOverlay.hidden = false;
      } else {
        backOverlay.hidden = true;
      }

      if (conf.frontPos) {
        frontDuplicate.hidden = false;
        frontTrans.x = conf.frontPos[0];
        frontTrans.y = conf.frontPos[1];
        if (conf.frontScale) {
          frontTrans.scaleX = conf.frontScale[0];
          frontTrans.scaleY = conf.frontScale[1];
        } else {
          frontTrans.scaleX = defaultScale;
          frontTrans.scaleY = defaultScale;
        }
      } else {
        frontDuplicate.hidden = true;
      }

      if (conf.frontOverlay) {
        frontOverlay.material.diffuse = Textures.get(conf.frontOverlay);
        frontOverlay.hidden = false;
        if (conf.frontOverlayPos) {
          frontOverlay.transform.x  = conf.frontOverlayPos[0];
          frontOverlay.transform.y = conf.frontOverlayPos[1];
        } else {
          frontOverlay.transform.x  = defaultPos;
          frontOverlay.transform.y = defaultPos;
        }
        if (conf.frontOverlayScale) {
          frontOverlay.transform.scaleX = conf.frontOverlayScale[0];
          frontOverlay.transform.scaleY = conf.frontOverlayScale[1];
        } else {
          frontOverlay.transform.scaleX = defaultScale;
          frontOverlay.transform.scaleY = defaultScale;
        }
      } else {
        frontOverlay.hidden = true;
      }
    }
    if (conf.rating) {
      setStarConfig(false, conf.rating);
      setEffectRating(true, conf.rating);
    } else {
      setStarConfig(true);
      setEffectRating(false);
    }
  }
}

function showFilters() {
  const brand = brands[currentBrand];
  const options = brand.effects.map((effect) => ({image_texture: Textures.get(effect.icon)}));
  const defaultEffect = 0; // options.length > 0 ? 1: 0;
  options.unshift({image_texture: Textures.get('option none')});
  picker.configure({
    selectedIndex: defaultEffect,
    items: options,
  });
  loadEffect({newValue: defaultEffect});
  pickerSubscription = picker.selectedIndex.monitor().subscribe(loadEffect);
  picker.visible = Reactive.val(true);
}

function showOnDetect() {
  const config = brands[currentBrand].onDetect;
  if (config.glowName) {
    glow.material.diffuse = Textures.get(config.glowName);
    glow.material.opacity = 1;
    glow.transform.scaleX = config.glowScale[0];
    glow.transform.scaleY = config.glowScale[1];
    if (config.glowDelay) {
      clearSparkTimeout(glowDelayTimout);
      glowDelayTimout  = Time.setTimeout(() => {
        glowDelayTimout = null;
        glow.hidden = false;
      }, config.glowDelay);
    } else {
      glow.hidden = false;
    }
  }
  if (config.sequenceName) {
    const sequenceTexture = Textures.get(config.sequenceName);
    sequence.material.diffuse = sequenceTexture
    sequence.material.opacity = 1;
    sequence.transform.scaleX = config.sequenceScale[0];
    sequence.transform.scaleY = config.sequenceScale[1];
    const duration = 1000 * config.frames / config.fps;
    const td = Animation.timeDriver({
      durationMilliseconds: duration,
      mirror: false,
      loopCount: 1,
    });
    sequenceTexture.currentFrame = Animation.animate(td, Animation.samplers.linear(0, config.frames - 1));
    td.start();
    sequence.hidden = false;
  }
  clearSparkTimeout(fadeDetectTimeout);
  fadeDetectTimeout = Time.setTimeout(() => {
    fadeDetectTimeout = null;
    const td = Animation.timeDriver({
      durationMilliseconds: config.fadeDuration || fadeDuration,
      mirror: false,
      loopCount: 1,
    });
    glow.material.opacity = Animation.animate(td, Animation.samplers.linear(1, 0));
    sequence.material.opacity = Animation.animate(td, Animation.samplers.linear(1, 0));
    td.start();
  }, config.fadeDelay || 1200);
}

function hideOnDetect() {
  glowDelayTimout = clearSparkTimeout(glowDelayTimout);
  detectSequenceTimout = clearSparkTimeout(detectSequenceTimout);
  glow.hidden = true;
  sequence.hidden = true;
}

brands.map((brand, i) => {
  Patches.getBooleanValue(brand.detector).monitor().subscribe((arg) => {
    if (arg.newValue) {
      if (currentBrand === i) return;
      currentBrand = i;
      setCouponVisiblity(false, true, brand.coupon);
      setRaterVisibility(true);
      setTextVisibility(true);
      showOnDetect();
      starContainer.hidden = false;
      setStarConfig(false);
      loadEffect({newValue: 0});
    } else {
      loadEffect({newValue: 0});
      hideOnDetect();
      setCouponVisiblity(false, true);
      setRaterVisibility(false);
      setTextVisibility(false);
      starContainer.hidden = true;
      setStarConfig(true);
      currentBrand = null;
      if (pickerSubscription) {
        pickerSubscription.unsubscribe();
        pickerSubscription = null;
      }
      picker.visible = Reactive.val(false);
    }
  });
});
