export default [
  {
    "name": "sample logo",
    "detector": "targetDetected",
    "coupon": "coupon",
    "onDetect": {
      "sequenceName": "anim seq",
      "sequenceScale": [6, 6],
      "fps": 24,
      "frames": 23,
      "fadeDelay": 2400,
      "fadeDuration": 1200
    },
    "effects": [
      {
        "icon": "option 1",
        "specialMat": "sample effect 1 mat",
        "rating": {
          "s": 0.4,
          "dx": 0,
          "ox": 0,
          "dy": 25,
          "ix": 160,
          "iy": -182,
          "activeStar": "sample filter 1 active star",
          "inactiveStar": "sample filter 1 inactive star",
          "specialMat": "sample effect 1 rate mat",
          "rateScale": 0.79,
          "ratePosX": 158,
          "ratePosY": -250.5,
        },
      }, {
        "icon": "option 2",
        "backPos": [0, 0],
        "backScale": [1, 1],

        "backOverlay": "sample filter 2",

        "frontPos": null,
        "frontScale": null,

        "frontOverlay": null,
        "frontOverlayScale": null,
        "frontOverlayPos": null,

        "rating": {
          "s": 0.5,
          "dx": 37.5,
          "ox": 0,
          "ix": -130.77213,
          "iy": 175.33595,
          "activeStar": "sample filter 2 star",
          "textureSequence": "animationSequence1",
          "rateScale": 1.5,
          "ratePosX": -75, 
          "ratePosY": 230,
        },
      }, {
        "icon": "option 3",

        "backPos": [0, 0],
        "backScale": [1, 1],

        "backOverlay": "sample filter 3",

        "frontPos": null,
        "frontScale": null,

        "frontOverlay": null,
        "frontOverlayScale": null,
        "frontOverlayPos": null,

        "rating": {
          "s": 0.5,
          "dx": 37.5,
          "ox": 0,
          "ix": -130.77213,
          "iy": 175.33595,
          "activeStar": "sample filter 3 star",
          "specialMat": "sample effect 3 rate mat",
          "rateScale": 1.5,
          "ratePosX": -75, 
          "ratePosY": 230,
        },
      }, {
        "icon": "option 4",

        "backPos": [0, 0],
        "backScale": [1, 1],
        
        "backOverlayMat": "sample effect 4",

        "frontPos": [-13.04395, -39.05453],
        // "frontScale": [0.80323, 0.80323],
        "frontScale": [0.75, 0.75],

        "frontOverlay": "sample filter 4 2",
        "frontOverlayScale": [1.81579, 1.81579],
        "frontOverlayPos": [95.02673, -241.01833],

        "rating": {
          "s": 0.5,
          "dx": 37.5,
          "ox": 0,
          "ix": -130.77213,
          "iy": 125.33595,
          "activeStar": "star active",
          "inactiveStar": "star inactive",
          "specialMat": "sample effect 3 rate mat",
          "rateScale": 1.5,
          "ratePosX": -75, 
          "ratePosY": 180,
        },
      }
    ]
  }
]