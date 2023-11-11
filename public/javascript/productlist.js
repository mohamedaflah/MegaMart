document.addEventListener("DOMContentLoaded", function () {
    var sliderRange = document.getElementById("slider-range");
    var amount = document.getElementById("amount");
  
    noUiSlider.create(sliderRange, {
      range: {
        min: 130,
        max: 500,
      },
      start: [130, 250],
      connect: true,
      step: 1,
    });
  
    sliderRange.noUiSlider.on("update", function (values) {
      amount.value = "$" + values[0] + " - $" + values[1];
    });
  
    amount.value =
      "$" +
      sliderRange.noUiSlider.get()[0] +
      " - $" +
      sliderRange.noUiSlider.get()[1];
  });
  