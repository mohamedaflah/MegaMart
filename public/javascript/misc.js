async function addToCart(event, id, inComing) {
  event.stopPropagation();
  if (inComing == "home") {
    document.getElementById("changeImg").src = "/images/sp3.svg";
  }
  // /users/product/add-to-cart/<%-data._id%>
  const response = await fetch(`/users/product/add-to-cart/${id}`).then(
    (re) => {
      return re.json();
    }
  );
  if (response.status) {
    let ct = document.getElementById("cartCnt");
    let current = ct.textContent;
    ct.textContent = Number(current) + 1;
  }
}
function showPreviewImg(productId, todisplayimage, appendingImgtag) {
  let displayImageTag = document.getElementById(appendingImgtag);
  fetch(`/product/detail/${productId}/${todisplayimage}`)
    .then((response) => response.json())
    .then((res) => {
      let productData = res.productData;
      let image = res.mainImageas;
      displayImageTag.src = `/product-images/${productData[0].image[0][image]}`;
      displayImageTag.setAttribute(
        "src",
        `/product-images/${productData[0].image[0][image]}`
      );
    });
  let options = {
    width: 300,
    zoomWidth: 300,
    offset: { vertical: 0, horizontal: 210 },
  };
  new ImageZoom(document.getElementById("img-container"), options);
}

function checkoutWithAddress(event, userId) {
  const checkoutFormForAddress = document.getElementById("checkoutform1");
  const name = document.getElementById("name");

  const email = document.getElementById("email");
  const state = document.getElementById("state");
  const district = document.getElementById("district");
  const pincode = document.getElementById("pincode");
  const street = document.getElementById("street");
  const phone = document.getElementById("phone");
  const apartment = document.getElementById("apar");
  const selectedPaymentMethod = document.querySelector(
    'input[name="payment_method"]:checked'
  );
  event.preventDefault();
  //let val = document.getElementById("name");
  let formData = {
    name: name.value,
    email: email.value,
    state: state.value,
    district: district.value,
    pincode: pincode.value,
    street: street.value,
    phone: phone.value,
    apartment: apartment.value,
    payment_method: selectedPaymentMethod.value,
  };

  fetch(`http://localhost:5001/users/product/checkout/address/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData), // Use formData, not new FormData(checkoutFormForAddress)
  })
    .then((response) => response.json())
    .then((res) => {
      console.log(res.status + " -______- status");
      if (res.status === "COD") {
        location.href = `/users/product/checkout/payment/success/${userId}`;
      } else {
        razorpayPayment(res, userId);
      }
    });
  //.catch((err)=>{
  //  alert('error is'+err)
  //});
}

function checkoutformSubmit(event, userId) {
  //let placeorderbtn=document.getElementById("placeorderbtn")
  //placeorderbtn.disabled=true;
  //placeorderbtn.innerHTML=`Processing...<img src="/images/loading.png"  alt="">`
  //setTimeout(()=>{
  //    placeorderbtn.disabled=false
  //    placeorderbtn.innerHTML=`Place Order`
  //},2000)
  const checkoutformwithoutAddress = document.getElementById("forCheckout");
  const address = document.querySelector('input[name="address"]:checked');
  const payment_method = document.querySelector(
    'input[name="payment_method"]:checked'
  );
  event.preventDefault();

  if (!window.razorpayWindowClosed) {
    let checkoutFormdata = {
      address: address.value,
      payment_method: payment_method.value,
    };

    fetch(`/users/product/cart/checkout/place-order/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutFormdata),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.status === "COD") {
          location.href = `/users/product/checkout/payment/success/${userId}`;
        } else if (res.status == "Wallet") {
          location.href = `/users/product/checkout/payment/success/${userId}`;
        } else {
          razorpayPayment(res, userId);
        }
      });
  } else {
    // Handle the case when the Razorpay window was closed
    alert("Payment window was closed. Please try again.");
    // Optionally, you can reset the flag
    window.razorpayWindowClosed = false;
  }
}

function razorpayPayment(order, userId) {
  let options = {
    key: "rzp_test_4DklPLkGmokBbK",
    amount: order.amount,
    currency: "INR",
    order_id: order.order_id,
    handler: (response) => {
      console.log(response);
      if (response.razorpay_payment_id) {
        window.location.href = `http://localhost:5001/users/product/checkout/payment/success/${userId}`;
      }
    },
    theme: {
      color: "#de3641",
      image:
        "https://png.pngtree.com/element_our/md/20180620/md_5b29c1dab1cf4.jpg", // URL of your logo
    },
  };
  const rzp = new Razorpay(options);
  rzp.on("payment.window.beforeclose", function () {
    window.razorpayWindowClosed = true;
  });
  rzp.open();
}

async function addToWhishList(productId, userId) {
  // alert('sd')
  // /users/product/whishlist/add-to-whishlist/:productId/:userId
  let response = await fetch(
    `/users/product/whishlist/add-to-whishlist/${productId}/${userId}`
  );
  let res = await response.json();
  console.log(res + "  sre");
  if (res.status) {
    let ct = document.getElementById("whish");
    let current = ct.textContent;
    ct.textContent = Number(current) + 1;
  }
}
function removeItemFromWhish(event, productId, userId, noneBox, operation) {
  try {
    event.stopPropagation();
    const invisibleBox = document.getElementById(noneBox);
    const whishCountinWhish = document.getElementById("whiCountinWHish");
    if (operation == "remove") {
      fetch(
        `/users/product/whishlist/remove-product-whish/${productId}/${userId}`
      )
        .then((response) => response.json())
        .then((res) => {
          if (res.status) {
            invisibleBox.style.display = "none";
            let ct = document.getElementById("whish");
            let current = ct.textContent;
            ct.textContent = Number(current) - 1;
            let whiShCurr = Number(whishCountinWhish.textContent);
            whishCountinWhish.textContent = whiShCurr - 1;
          } else {
            alert("err");
          }
        });
    } else {
      fetch(`/users/product/whishlist/move-product-cart/${productId}/${userId}`)
        .then((response) => response.json())
        .then((res) => {
          if (res.status) {
            invisibleBox.style.display = "none";
            let ct = document.getElementById("whish");
            let current = ct.textContent;
            ct.textContent = Number(current) - 1;
            let whiShCurr = Number(whishCountinWhish.textContent);
            whishCountinWhish.textContent = whiShCurr - 1;
            if (!res.productExistStatus) {
              let cart = document.getElementById("cartCnt");
              let cartCntCurrent = cart.textContent;
              cart.textContent = Number(cartCntCurrent) + 1;
            }
          } else {
            alert("erlk");
          }
        });
    }
  } catch (err) {}
}
// show errors
function loginFormSubmit(e) {
  try {
    e.preventDefault();
    let errDivForLog = document.getElementById("errLog");
    let errShowing = document.getElementById("showLoginErr");
    let email = document.getElementById("emailOrMobileInputforLogin").value;
    let pass = document.getElementById("passlog").value;

    let formData = {
      email_or_Phone: email,
      password: pass,
    };
    axios
      .post(`http://localhost:5001/user/login`, {
        formData,
      })
      .then((response) => {
        if (response.data.err) {
          errDivForLog.style.visibility = "visible";
          errShowing.textContent = response.data.err;
          setTimeout(() => {
            errDivForLog.style.visibility = "hidden";
          }, 3000);
        }
        if (response.data.admin) {
          window.location.href = "/admin/";
        }
        if (response.data.status) {
          window.location.href = "/";
        }
      });
  } catch (err) {
    alert(err);
  }
}
function loginErrClose() {
  document.getElementById("errLog").style.visibility = "hidden";
}

function openCoupon() {
  document.querySelector(".coupon_see").classList.add("active");
}
function cuponClose() {
  document.querySelector(".coupon_see").classList.remove("active");
}

function applyCoupon(event, userId) {
  event.preventDefault();
  let couponcode = document.getElementById("couponcode");
  const formBody = {
    couponcode: couponcode.value,
  };
  fetch(`/users/coupon/applycoupon/?id=${userId}`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(formBody),
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.err) {
        alert(res.err);
      }
      if (res.status) {
        let total = document.getElementById("aftertotal");
        let current = Number(total.textContent);
        let discount = Number(res.discount);
        // confirm(current+'    '+discount)
        total.textContent = current - discount;
        total.style.color = "red";
        alert("Coupon Apply Succefull");
        document.getElementById("couponBoxInput").style.visibility = "hidden";
        // alert('deducted ')
      }
    });
}

function openReturn(productId, orderId) {
  confirm("are you sure to return");
  sessionStorage.setItem("productId", productId);
  sessionStorage.setItem("orderId", orderId);
  document.getElementById("returpop").style.display = "flex";

  // Scroll the page to the center vertically
  const windowHeight = window.innerHeight;
  const element = document.getElementById("returpop"); // The element you want to center on

  if (element) {
    const elementHeight = element.clientHeight;
    const scrollToY = element.offsetTop - (windowHeight - elementHeight) / 2;

    window.scrollTo({
      top: scrollToY,
      behavior: "smooth", // You can use 'auto' for an instant scroll
    });
  }
  fetch(`/users/products/return/getreturnitem/?id=${productId}`)
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      let img = document.getElementById("productimgdisplay");
      img.setAttribute(
        "src",
        `/product-images/${res.product.image[0].mainimage}`
      );
      img.src = `/product-images/${res.product.image[0].mainimage}`;
    });
}

function returnclose() {
  document.getElementById("returpop").style.display = "none";
  // document.getElementById("")
}
function showReturnImage(inputId, imageId) {
  let input = document.getElementById(inputId);
  let image = document.getElementById(imageId);
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      // image.setAttribute('src',e.target.result)
      image.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// document.getElementById("returnForm").addEventListener("submit",()=>{
//   alert('hle')
// })
let fm = document.getElementById("returnForm");
function returnForm(event, userId) {
  event.preventDefault();
  let fm = document.getElementById("returnForm");
  let productId = sessionStorage.getItem("productId");
  let orderId = sessionStorage.getItem("orderId");
  // alert(productId);
  let reason = document.getElementById("reson");
  let Reason = reason.options[reason.selectedIndex].value;
  if (Reason == "other") {
    Reason = document.getElementById("tex").value;
  }
  let fil = document.getElementById("wrng");

  if (fil.files && fil.files.length > 0) {
    // Extract the details of the selected file
    const selectedFile = fil.files[0];

    // Create a new FormData object from the form element
    let formDt = new FormData();

    // Append the selected file to the FormData object with the correct field name
    formDt.append("file", selectedFile);
    formDt.append("reason", Reason);

    // alert("Selected reason: " + Reason);
    // alert("Selected file name: " + selectedFile.name);
    // alert("Selected file size: " + selectedFile.size + " bytes");
    // alert("Selected file type: " + selectedFile.type);
    // alert(JSON.stringify(selectedFile));
    fetch(
      `/users/product/orders/returnproduct/${productId}/${userId}/?orderId=${orderId}`,
      {
        method: "POST",
        body: formDt,
      }
    )
      .then((respons) => respons.json())
      .then((res) => {
        if (res.status) {
          location.href = `http://localhost:5001/users/product/orders/trackorders/${userId}`;
        }
        if (res.err) {
          alert(res.err);
        }
      });
  } else {
    alert("Please upload the wrong image");
  }
}

function displayTxt() {
  let Reason = document.getElementById("reson");
  if (Reason.value == "other") {
    document.getElementById("txtarea").classList.add("active");
  }
  if (Reason.value !== "other") {
    document.getElementById("txtarea").classList.remove("active");
  }
}

function copyLink(link) {
  let copyMessage = document.getElementById("copymsg");
  let changinImg = document.getElementById("changeCopyImage");
  navigator.clipboard.writeText(link);
  copyMessage.style.display = "block";
  changinImg.setAttribute("src", "/images/copytick.svg");
  changinImg.src = "/images/copytick.svg";
  setTimeout(() => {
    copyMessage.style.display = "none";
    changinImg.setAttribute("src", "/images/copy.svg");
    changinImg.src = "/images/copy.svg";
  }, 2000);
}
function openSharing(){
  document.querySelector(".referal_share").classList.add("active")
}
function inviteBoxClose(){
  document.querySelector(".referal_share").classList.remove("active")
}

function shareOnWhatsapp(useId){
  const referalLink=`http://localhost:5001/signup?id=${useId}`
  const message="Check out this amazing invitation linkis"+referalLink
  const whatsappUrl=`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl,'_blank')
  // whatsapp-share-button
}
