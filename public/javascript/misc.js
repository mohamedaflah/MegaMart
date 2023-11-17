async function addToCart(event, id, inComing, userId, animationimg) {
  event.stopPropagation();
  swal("Success", "Product Added in Cart", "success");
  if (inComing == "home") {
  } else if (inComing == "products") {
    document.getElementById(animationimg).textContent = "Go to cart";
  } else {
    document.querySelector(`.${animationimg}`).style.display = "block";
    document.getElementById("cartTxt").textContent = "Go to Cart";
    document.getElementById("cartTxt").onclick = () => {
      location.href = `/users/product/cart/showcart/${userId}`;
    };
    setTimeout(() => {
      document.querySelector(`.${animationimg}`).style.display = "none";
    }, 1500);
  }
  Toastify({
    text: "Product Added in Cart",
    className: "info",
    duration: 2000,
    close: false,
    gravity: "top",
    position: "center",
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    }
  }).showToast();
  // /users/product/add-to-cart/<%-data._id%>
  const response = await fetch(`/users/product/add-to-cart/${id}`).then(
    (re) => {
      let ct = document.getElementById("cartCnt");
      let current = ct.textContent;
      ct.textContent = Number(current) + 1;
      return re.json();
    }
  );
  if (response.status) {
  }
}
function increaseCartQty(
  qtybtn,
  userId,
  productId,
  qtytochange,
  cartData,
  subtotalsection,
  qtyshow,
  decrease,
  price,
  stock
) {
  const qtyShow = document.getElementById(qtyshow);
  document.getElementById("load").style.display='flex'
  setTimeout(()=>{
    document.getElementById("load").style.display='none'
  },2000)
  fetch(
    `/users/product/cart/increaseqty/${userId}/${productId}/?qty=${qtytochange}`
  )
    .then((response) => response.json())
    .then((response) => {
      if (response.status) {
        let currentQty = qtyShow.textContent;
        let afterIncreasing = Number(currentQty) + Number(qtytochange);
        const subtotal = document.getElementById(subtotalsection);
        if (afterIncreasing <= 9) {
          qtyShow.textContent = `0${afterIncreasing}`;
        } else {
          qtyShow.textContent = `${afterIncreasing}`;
        }
        let qtybtn1 = document.getElementById(qtybtn);
        const currentStock = response.stock;
        let decreaseBtn = document.getElementById(decrease); // Updated the ID
        if (
          Number(qtyShow.textContent) >= Number(currentStock) ||
          response.stock <= 0
        ) {
          qtybtn1.style.visibility = "hidden";
        } else {
          qtybtn1.style.visibility = "visible";
        }
        // alert(Number(qtyShow.textContent),' quantity')
        if (Number(qtyShow.textContent) >= 2) {
          decreaseBtn.style.visibility = "visible";
        } else {
          decreaseBtn.style.visibility = "hidden";
        }
        let currentSubtotal = subtotal.textContent.trim();
        subtotal.textContent = `₹${response.subtotal}`;
        document.getElementById(
          "finalsub"
        ).textContent = `₹${response.totalAmount}`;
        document.getElementById("aftertotal").textContent =
          response.totalAmount;
      }
    });
}
function removeItemfromCart(
  userId,
  productId,
  deletingRow,
  subtotal,
  maintotal,
  currentLength,
) {
  localStorage.setItem("userId",userId)
  var refresh=false
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this product !",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      swal("Poof! Your Product has been deleted!", {
        icon: "success",
      });
      currentLength-=1
      alert(currentLength)
      if(currentLength<=1){
        window.location.reload()
      }
      document.getElementById(deletingRow).style.display = "none";
      fetch(`/users/product/cart/deleteitemfromcart/${userId}/${productId}/`)
        .then((response) => response.json())
        .then((res) => {
          if (res.status) {
            console.log("item delted");
            document.getElementById(subtotal).textContent = `₹${res.totalAmount}`;
            document.getElementById(maintotal).textContent = res.totalAmount;
            const cartCount = document.getElementById("cartCnt");
            const current = cartCount.textContent;
            cartCount.textContent = Number(current) - 1;
          }
        });
    } else {
      swal("Your Excpected Product is safe!");
    }
  });
}
function showPreviewImg(productId, todisplayimage, appendingImgtag) {
  let displayImageTag = document.getElementById(appendingImgtag);
  // fetch(`/product/detail/${productId}/${todisplayimage}`)
  //   .then((response) => response.json())
  //   .then((res) => {
  //     let productData = res.productData;
  //     let image = res.mainImageas;
  //     displayImageTag.src = `/product-images/${productData[0].image[0][image]}`;
  //     displayImageTag.setAttribute(
  //       "src",
  //       `/product-images/${productData[0].image[0][image]}`
  //     );
  //   });
  let alreadySrc = document.getElementById(todisplayimage);
  let mainsrc = displayImageTag.src;
  let toSrc = alreadySrc.src;
  displayImageTag.src = toSrc;
  alreadySrc.src = mainsrc;
  let options = {
    width: 300,
    zoomWidth: 300,
    offset: { vertical: 0, horizontal: 210 },
  };
  new ImageZoom(document.getElementById(appendingImgtag), options);
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
  };

  fetch(`/users/product/checkout/address/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData), // Use formData, not new FormData(checkoutFormForAddress)
  })
    .then((response) => response.json())
    .then((res) => {
      console.log(res.status + " -______- status");
      if (res.status) {
        location.href = `/users/product/cart/checkout/place-order/${userId}`;
      }
    });
  //.catch((err)=>{
  //  alert('error is'+err)
  //});
}
function submitCheckoutFormExplicit(userId, seletedmethod) {
  const address = document.querySelector('input[name="address"]:checked');
  const payment_method = document.querySelector(
    'input[name="payment_method"]:checked'
  );
  // if(payment_method.value=='COD'){
  // }
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
      if (seletedmethod !== "Bank") {
        location.href = `/users/product/checkout/payment/success/${userId}`;
      }
    });
}

function placeOrderCheckout(userId, totalAmount) {
  localStorage.setItem("userId", userId);
  const payment_method = document.querySelector(
    'input[name="payment_method"]:checked'
  ).value;
  if (payment_method == "COD") {
    // document.getElementById("forCheckout").submit();
    submitCheckoutFormExplicit(userId, "COD");
  } else if (payment_method == "Wallet") {
    // document.getElementById("forCheckout").submit();
    submitCheckoutFormExplicit(userId, "Wallet");
  } else {
    fetch("/users/orders/checkout/razorpay/generaterazorpay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, totalAmount }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.order) {
          razorpayPayment(res.order, userId);
        } else {
          alert(JSON.stringify(res));
        }
      });
  }
}
function razorpayPayment(order, userId) {
  let options = {
    key: "rzp_test_4DklPLkGmokBbK",
    amount: order.amount,
    currency: "INR",
    order_id: order.id,
    handler: (response) => {
      console.log(response);
      if (response.razorpay_payment_id) {
        verifyRazorpayPayment(order.id, response.razorpay_payment_id, userId);
      } else {
        alert("window closed");
      }
    },
    theme: {
      color: "#de3641",
      image:
        "https://png.pngtree.com/element_our/md/20180620/md_5b29c1dab1cf4.jpg", // URL of your logo
    },
  };
  const rzp = new Razorpay(options);
  rzp.on("payment.failed", function (response) {
    alert("Payment Failed " + response.error.description);
  });
  rzp.on("payment.window.beforeclose", function () {
    // window.razorpayWindowClosed = true;
    handleRazorpayClosureOrFailure();
  });
  // rzp.on()
  rzp.open();
}

function verifyRazorpayPayment(orderId, paymentId, userId) {
  // alert("reached");
  try {
    fetch(`/users/orders/checkout/razorpay/verifyrazorpaypayment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, paymentId }),
    })
      .then((response) => response.json())
      .then(async (res) => {
        if (res.status) {
          // document.getElementById("forCheckout").submit();

          submitCheckoutFormExplicit(localStorage.getItem("userId"), "Bank");
          location.href = `/users/product/checkout/payment/success/${userId}`;
        } else {
          alert("Payment verification failed");
          alert(JSON.stringify(res));
        }
      });
  } catch (err) {
    alert(JSON.stringify(err));
  }
}
function checkoutformSubmit(event, userId) {

  const checkoutformwithoutAddress = document.getElementById("forCheckout");
  const address = document.querySelector('input[name="address"]:checked');
  const payment_method = document.querySelector(
    'input[name="payment_method"]:checked'
  );
  // if(payment_method.value=='COD'){
  // }
  event.preventDefault();
  if (window.razorpayWindowClosed) {
    alert("Payment window was closed. Please try again.");
    event.preventDefault(); // Prevent the form from submitting
    return;
  }
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
      if (res.status === "COD" || res.status == "Wallet") {
        location.href = `/users/product/checkout/payment/success/${userId}`;
      }
    });
}


function handleRazorpayClosureOrFailure() {
  alert("Payment window was closed or there was a failure. Please try again.");
  window.razorpayWindowClosed = false;
}

async function addToWhishList(productId, userId) {

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
      .post(`/user/login`, {
        formData,
      })
      .then((response) => {
        if (response.data.err) {
          errDivForLog.style.visibility = "visible";
          errShowing.textContent = response.data.err;
          setTimeout(() => {
            errDivForLog.style.visibility = "hidden";
          }, 3000);
          shoToast(response.data.err);
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
function shoToast(msg) {
    Toastify({
    text: msg,
    className: "info",
    duration: 2000,
    close: true,
    gravity: "top",
    position: "center",

    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    }
  }).showToast();
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
        let duductedAmount = current * (discount / 100);
        total.textContent = current - duductedAmount;
        total.style.color = "red";
        alert("Coupon Apply Succefull");
        document.getElementById("couponBoxInput").style.visibility = "hidden";
        // alert('deducted ')
      }
    });
}

function openReturn(productId, orderId, finalprice) {
  confirm("are you sure to return");
  sessionStorage.setItem("productId", productId);
  localStorage.setItem("finalpriceforreturn", finalprice);
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
  let finalprice = localStorage.getItem("finalpriceforreturn");
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
      `/users/product/orders/returnproduct/${productId}/${userId}/?orderId=${orderId}&&finalprice=${finalprice}`,
      {
        method: "POST",
        body: formDt,
      }
    )
      .then((respons) => respons.json())
      .then((res) => {
        if (res.status) {
          location.href = `/users/product/orders/trackorders/${userId}`;
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
function openSharing() {
  document.querySelector(".referal_share").classList.add("active");
}
function inviteBoxClose() {
  document.querySelector(".referal_share").classList.remove("active");
}

function shareOnWhatsapp(useId) {
  const referalLink = `https://aflahaflu.shop/signup?id=${useId}`;
  const message = "Check out this amazing invitation linkis" + referalLink;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    message
  )}`;
  window.open(whatsappUrl, "_blank");
  // whatsapp-share-button
}

function searchProductInHome(e, profile, comingfrom) {
  let searchData = {
    searchdata: e.target.value,
  };
  fetch("/users/product/search-product/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searchData),
  })
    .then((response) => response.json())
    .then((res) => {
      let productData = res.productData;
      let mainSection = [];
      let forListProduct = [];
      let id = localStorage.getItem("userId");
      if (productData.length >= 1) {
        productData.forEach((data) => {
          if (!data.deletionStatus) {
            const card = `
  <div class="product_card">
      ${
        data.stock < 1
          ? `
          <div class="unavailable">
              <p>out of stock</p>
          </div>`
          : ""
      }

      <div class="image_section">
          <div class="move">
              ${
                data.stock < 1
                  ? `
                  <a style="z-index: 99; visibility: hidden;">
                      <img src="/images/spcrt.svg" alt="">
                  </a>`
                  : profile
                  ? `
                      <a style="z-index: 99;" onclick="addToCart('${data._id}')">
                          <img src="/images/spcrt.svg" alt="">
                      </a>`
                  : `
                      <a href="/users/product/add-to-cart/${data._id}">
                          <img src="/images/spcrt.svg" alt="">
                      </a>`
              }

              <a href="">
                  <img src="/images/movewish.svg" alt="" class="whish">
              </a>
          </div>
          <img src="/product-images/${
            data.image[0].mainimage
          }" alt="" onclick="gotoDetail('${data._id}')">
      </div>

      <div class="detail_section" onclick="gotoDetail('${data._id}')">
          <p>${data.productName}</p>
          <div class="price">
              <p class="discounted">
                  ${data.discount ? `₹${data.discount}` : `₹${data.price}`}
              </p>
              <p class="mrp">
                  ${data.discount ? `₹${data.price}` : ""}
              </p>
          </div>
          <div class="star_rating">
              <img src="/images/star.svg" alt="">
              <img src="/images/star.svg" alt="">
              <img src="/images/star.svg" alt="">
              <img src="/images/star.svg" alt="">
              <img src="/images/star.svg" alt="">
          </div>
      </div>
  </div>
`;
            let productListcard = `
<a class="col-xl-2 col-lg-3 col-md-4 col-sm-6 d-flex col-6 justify-content-center text-decoration-none text-dark" onclick="window.location.href='/products/product-detail/${
              data._id
            }/mainimage'">
<div class="card d-flex flex-column justify-content-between position-relative" style="width: 12rem;height: 15rem;box-shadow: 0px 1px 13px 0px rgba(0, 0, 0, 0.156);border: none;">
    ${
      data.stock < 1
        ? `<span style="font-size: 12px;padding:2px;background: rgba(255, 0, 0, 0.224);width: 90px;margin: 2px;border-radius: 30px;display: flex;align-items: center;justify-content: center;" class="text-white">out of stock</span>`
        : `<span style="visibility:hidden;font-size: 12px;padding:2px;background: rgba(255, 0, 0, 0.224);width: 90px;margin: 2px;border-radius: 30px;display: flex;align-items: center;justify-content: center;" class="text-white"></span>`
    }
    <div class="img d-flex justify-content-center" style="border-bottom: 1px solid rgb(205, 205, 205);height: 6rem;">
        <img src="/product-images/${
          data.image[0].mainimage
        }" style="height: 80%;width: auto;" alt="" class="card-top-img mt-2">
    </div>
    <div class="px-2">
        <span style="font-size: 13px;">${data.productName}</span>
    </div>
    <div class="px-2 d-flex justify-content-between">
        <span style="font-size: 13px;">
            ${data.discount ? `₹${data.discount}` : `₹${data.price}`}
        </span>
        <span style="font-size: 13px;text-decoration: line-through;">
            ${data.discount ? `₹${data.price}` : ""}
        </span>
    </div>
    <div class="px-2 d-flex justify-content-between mb-2">
        ${
          data.stock < 1
            ? `<button class="btn-dark m-0 py-1 px-3 disabled" style="font-size: 12px;background: rgba(107, 105, 105, 0.818);cursor: no-drop;" disabled>Add to cart</button>`
            : `<button class="btn-dark m-0 py-1 px-3" style="font-size: 12px;" ${
                id ? "" : "onclick=\"window.location.href='/user/login'\""
              }>Add to cart</button>`
        }
        ${
          id
            ? `<button class="btn-dark m-0 py-1 px-2" style="font-size: 15px;"><i class="fa fa-heart"></i></button>`
            : ""
        }
    </div>
</div>
</a>
`;
            forListProduct.push(productListcard);
            mainSection.push(card);
          }
        });
        if (comingfrom == "home") {
          const datas = mainSection.join("");
          document.getElementById("prod_section").innerHTML = datas;
        } else {
          const listdata = forListProduct.join("");
          document.getElementById("displayData").innerHTML = listdata;
        }
      } else {
        if(comingfrom=='home'){
          document.getElementById(
            "prod_section"
          ).innerHTML = `<h3>Search Data Not Found "${e.target.value}"</h3>`;
        }else{
          document.getElementById(
            "displayData"
          ).innerHTML = `<h3>Search Data Not Found "${e.target.value}"</h3>`;
        }
        
      }
    });
}


