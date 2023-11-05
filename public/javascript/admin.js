const productAddingForm = document.getElementById("prodform");
const errContainer = document.getElementById("errcontainer");
const showErr = document.getElementById("displayError");
var filesArray = [];
productAddingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  let formData = new FormData(productAddingForm);

  // Create an object to store both file names and other input values
  let formDataObj = {};

  for (var pair of formData.entries()) {
    const [key, value] = pair;

    if (value instanceof File) {
      formDataObj[key] = value; // File name
    } else {
      formDataObj[key] = value; // Other input values
    }
  }
  // alert(JSON.stringify(imageObj)+' image'))
  //   alert(JSON.stringify(formOBj.imag1.filename))
  fetch("/admin/products/add-products", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((res) => {
      if (res.status) {
        location.href = "/admin/products/";
        // document.querySelector('.add_product_section').classList.remove("active")
      }
      if (res.err) {
        showErr.textContent = res.err;
        errContainer.style.visibility = "visible";
        setTimeout(() => {
          errContainer.style.visibility = "hidden";
        }, 5000);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      alert(JSON.stringify(error) + " ere");
    });
});

// closing Product Adding Err box
function closeProductsErr() {
  errContainer.style.visibility = "hidden";
}

function previewImage(inputId, imgId, label) {
  const input = document.getElementById(inputId);
  const img = document.getElementById(imgId);
  const labeltext = document.getElementById(label);
  // Check if a file was selected
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    // Set up a function to run when the image is loaded
    reader.onload = function (e) {
      img.src = e.target.result;
      labeltext.style.display = "none";
    };

    // Read the selected file as a data URL and load it into the img tag
    reader.readAsDataURL(input.files[0]);
  } else {
    // If no file was selected or the browser doesn't support FileReader, clear the image
    img.src = "";
  }
}
// function closePreviewImage(inputId,imgId,label){
//   const input=document.getElementById(inputId)
//   const image=document.getElementById(imgId)
//   const label=document.getElementById(label)
//   input.value=''
//   // image.setAttribute('src','')
//   image.src=''
//   label.style.display='block'
// }

// search product

function searchProducts(event) {
  console.log(event.target.value);
  const formBody = { search: event.target.value };
  fetch("/admin/products/serach/searchproduct/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formBody),
  })
    .then((response) => response.json())
    .then((res) => {
      let productData = res.productData;
      console.log(res.categories);
      console.log(res.productData);
      const rows = [];
      if (productData.length >= 1) {
        productData.forEach((value) => {
          const row = `
                <div class="table_content data_section">
                    <div class="table_datas">${value.productName}</div>
                    <div class="table_datas" style="width: 10%;">${
                      value.price
                    }</div>
                    <div class="table_datas">
                        <img src="/product-images/${
                          value.image[0].mainimage
                        }" style="width: 33px;height: auto" alt="">
                    </div>
                    <div class="table_datas">
                        ${value.category}
                    </div>
                    <div class="table_datas" style="padding-left: 5px;">
                        ${value.stock}
                    </div>
                    <div class="table_datas">
                        ${
                          value.deletionStatus || value.stock <= 0
                            ? `<div class="blocked" style="width: 85px;">out of stock</div>`
                            : `<div class="active" style="width: 85px;">In Stock</div>`
                        }
                    </div>
                    <div class="table_datas">
                        <a href="/admin/products/edit-product/${
                          value._id
                        }" style="text-decoration: none;" title="Edit product">
                            <img src="/images/predit.svg" style="width: auto; height: 30px; margin-right: 10px;" alt="">
                        </a>
                        ${
                          value.deletionStatus
                            ? `<a href="/admin/products/recover-product/${value._id}" title="Recover product">
                                <img src="/images/recover.svg" style="width: 30px; height: 30px;" alt="">
                            </a>`
                            : `<a href="/admin/products/delete-product/${value._id}" title="delete product">
                                <img src="/images/delp.svg" style="width: 30px; height: 30px;" alt="">
                            </a>`
                        }
                    </div>
                </div>
            `;
          rows.push(row);
          const rowsHTML = rows.join("");

          document.getElementById("tb").innerHTML = rowsHTML;
          document.getElementById("tb").style.height = "auto";
        });
      } else {
        document.getElementById(
          "tb"
        ).innerHTML = `<h2 style="color:white;text-align:center">Search Data Not Found "${event.target.value}"</h2>`;
      }
    });
}

function searchUser(event) {
  console.log(event.target.value);
  let searvValue = {
    search: event.target.value,
  };
  fetch("/admin/user/search/searchuser/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searvValue),
  })
    .then((response) => response.json())
    .then((res) => {
      const usersData = res.usersData;
      let rows = [];
      if (usersData.length >= 1) {
        usersData.forEach((user) => {
          const row = `
                    <div class="table_content data_section">
                        <div class="table_datas">${user.name}</div>
                        <div class="table_datas">${user.email}</div>
                        <div class="table_datas">
                            ${
                              user.profileImage
                                ? `<img src="${user.profileImage}" alt="" style="width: 23px; height: 23px; border-radius: 50%;">`
                                : `<img src="/images/userprofile.svg" style="width: 23px; height: 23px;" alt="">`
                            }
                        </div>
                        <div class="table_datas">
                            ${(() => {
                              const d = new Date(user.joinDate);
                              const dayAr = [
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                                "Sunday",
                              ];
                              const monthAr = [
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                              ];
                              return `${d.getDate()} ${
                                monthAr[d.getMonth()]
                              } ${d.getFullYear()} ${dayAr[d.getDay() - 1]}`;
                            })()}
                        </div>
                        <div class="table_datas">
                            ${
                              user.status
                                ? `<div class="active">Active</div>`
                                : `<div class="blocked">Blocked</div>`
                            }
                        </div>
                        <div class="table_datas">
                            ${
                              user.status
                                ? `<a href="/admin/userblock/${user._id}" title="Block User"><img src="/images/block.svg" style="width: 30px; height: 30px;" alt=""></a>`
                                : `<a href="/admin/userunblock/${user._id}" title="Unblock User"><img src="/images/unblock.svg" style="width: 30px; height: 30px;" alt=""></a>`
                            }
                        </div>
                    </div>
                `;
          rows.push(row);
        });
        const rowHtml = rows.join("");
        document.querySelector(".usertable").innerHTML = rowHtml;
      } else {
        document.querySelector(
          ".usertable"
        ).innerHTML = `<h2 style="color:white;text-align:center">Search Data Not Found "${event.target.value}"</h2>`;
      }
    });
}

// (function(){
//   let blockBtn=document.querySelector("#blockBtn")
//   let unblockBtn=document.querySelector("#unblockBtn")
//   let blockImg=document.querySelector("#blockImg")
//   let unBlockImg=document.querySelector("#unBlockImg")

//   blockBtn.addEventListener("click",()=>{

//   })
// })
function editCoupon(couponId) {
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.localStorage.setItem("couponId", couponId);
  document.getElementById("editModal").classList.add("active");
  fetch(`/admin/products/cupons/getEditdata/${couponId}`)
    .then((response) => response.json())
    .then((res) => {
      // alert(JSON.stringify(data.couponData))
      const data = res.couponData;
      document.querySelector("#editcopounname").value = data.couponname;
      document.querySelector("#editcouponcode").value = data.couponcode;
      let date = new Date(data.statusChangeDate);
      document.querySelector("#editexpiry").value = formatDate(date);
      document.querySelector("#editcoupondiscount").value = data.discount;
      document.querySelector("#editlimit").value = data.usageLimit;
      document.querySelector("#minorderamt").value = data.minOrderAmt;
    });
}
function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
  const dd = date.getDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function removeEditModal() {
  document.getElementById("editModal").classList.remove("active");
}
// (function () {
//   const ctx = document.getElementById("myChart");

//   new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
//       datasets: [
//         {
//           label: "of votes",
//           data: [12, 9, 3, 2, 3],
//           borderWidth: 2,
//         },
//       ],
//     },
//     options: {
//       scales: {
//         y: {
//           beginAtZero: true,
//         },
//       },
//     },
//   });
// });
function getofferEditWindow(offerId) {
  window.scrollTo({ top: 0, behavior: "smooth" });
  localStorage.setItem("offerId", offerId);
  document.getElementById("offermodal").classList.add("active");
  fetch(
    `/admin/product/offers/referaloffer/getEditofferData/?offerId=${offerId}`
  )
    .then((response) => response.json())
    .then((data) => {
      const editData = data.editData;
      document.getElementById("offerinput").value = editData.offeramount;
    });
}
function updateOffAmt(e) {
  e.preventDefault();
  const offerId = localStorage.getItem("offerId");
  const offeramount = document.getElementById("offerinput").value;
  if (!offeramount.toString().trim()) {
    document.getElementById("erroShowing").textContent =
      "Please fill input field";
    return;
  }

  if (offeramount <= 0) {
    document.getElementById("erroShowing").textContent =
      "Enter only positive value";
    return;
  }
  if (offeramount >= 1000) {
    document.getElementById("erroShowing").textContent =
      "Maxium offer amount is 1000";
    return;
  }
  const formBody = { offeramount };
  fetch(
    `/admin/product/offers/referaloffer/updateofferamt?offerId=${offerId}`,
    {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(formBody),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        location.href = "http://localhost:5001/admin/product/offers/seeOffers";
      }
    });
}
function addCategoryOffer(event) {
  event.preventDefault();
  const offerCategorySelect = document.getElementById("offercategory");
  const offercategory =
    offerCategorySelect.options[offerCategorySelect.selectedIndex].value;
  const offeramount = document.getElementById("categoryofferamount").value;

  if (!offercategory) {
    document.getElementById("catoffererr").style.visibility = "visible";
    return;
  } else {
    document.getElementById("catoffererr").style.visibility = "hidden";
  }
  if (!offeramount) {
    document.getElementById("offerpercent").style.visibility = "visible";
    return;
  } else {
    document.getElementById("offerpercent").style.visibility = "hidden";
  }
  if (offeramount < 1 || offeramount > 90) {
    document.getElementById("offerpercent").textContent =
      "Must be enter percentage between 1 and 90";
    document.getElementById("offerpercent").style.visibility = "visible";
    return;
  } else {
    document.getElementById("offerpercent").style.visibility = "hidden";
  }

  const expiry = document.getElementById("expiry").value;
  if (new Date(expiry) <= new Date()) {
    document.getElementById("offerdateer").style.visibility = "visible";
    document.getElementById("offerdateer").textContent =
      "Please select latest date and time";
    return;
  }
  const formBody = {
    category: offercategory,
    offeramount: offeramount,
    expiry: expiry,
  };
  fetch("/admin/product/offers/categoryoffer/add-category-offer", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(formBody),
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.status) {
        location.href = `http://localhost:5001/admin/product/offers/categoryoffer/`;
      } else if (res.err) {
        alert(res.err);
      }
    });
}
function checkLatest(event) {
  let inputDate = new Date(event.target.value);
  let errorElement = document.getElementById("offerdateerr");

  if (inputDate <= new Date()) {
    errorElement.style.visibility = "visible";
    errorElement.textContent = "Please select a future date and time";
  } else {
    errorElement.style.visibility = "hidden";
  }
}
function showCorrespondingPrice(selecttag) {
  let selectOption = selecttag.options[selecttag.selectedIndex];

  let price = selectOption.getAttribute("data-price");
  document.getElementById(
    "showPrice"
  ).textContent = `Product Price is ₹${price}`;
}
function addProdcutOffer(event) {
  event.preventDefault();
  const offerProductSelect = document.getElementById("offerproduct");
  const offerproduct =
    offerProductSelect.options[offerProductSelect.selectedIndex].value;
  const price =
    offerProductSelect.options[offerProductSelect.selectedIndex].getAttribute(
      "data-price"
    );
  if (!offerproduct) {
    document.getElementById("offername").style.visibility = "visible";
    return;
  } else {
    document.getElementById("offername").style.visibility = "hidden";
  }
  const produtofferamount = document.getElementById("produtofferamount").value;
  if (!produtofferamount) {
    document.getElementById("productOffererr").style.visibility = "visible";
    return;
  } else {
    document.getElementById("productOffererr").style.visibility = "hidden";
  }
  if (produtofferamount < 1 || produtofferamount > 90) {
    document.getElementById("productOffererr").textContent =
      "Percentage must be between 1 and 90 %";
    document.getElementById("productOffererr").style.visibility = "visible";
    return;
  } else {
    document.getElementById("productOffererr").style.visibility = "hidden";
  }
  const expiry = document.getElementById("productOfferexpiry").value;
  if (!expiry) {
    document.getElementById("productOfferdateerr").style.visibility = "visible";
    return;
  } else {
    document.getElementById("productOfferdateerr").style.visibility = "hidden";
  }
  if (new Date(expiry) <= new Date()) {
    document.getElementById("productOfferdateerr").style.visibility = "visible";
    document.getElementById("productOfferdateerr").textContent =
      "Please select latest date and time";
    return;
  } else {
    document.getElementById("productOfferdateerr").style.visibility = "hidden";
  }
  // alert(price);
  const formBody = {
    productoffer: offerproduct,
    offeramount: produtofferamount,
    expiry: expiry,
  };
  // alert(JSON.stringify(formBody));
  fetch(`/admin/product/offers/productoffer/add-product-offer`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(formBody),
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.status) {
        window.location.href = `http://localhost:5001/admin/product/offers/productoffer/`;
      } else {
        alert(res.err);
      }
    });
}
function getCategoryOfferModal(popup, categoryId) {
  try {
    document.getElementById(popup).classList.add("active");
    localStorage.setItem("categoryofferId", categoryId);
    fetch(
      `/admin/product/offers/categoryoffer/getupdatecategoryoffer/?offerId=${categoryId}`
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.err) {
          return alert(res.err);
        }
        const categoryofferData = res.categoryOfferData;

        const updatecategoryoffercategory = document.getElementById(
          "updatecategoryoffercategory"
        );
        const updatecategoryofferpercentage = document.getElementById(
          "updatecategoryofferpercentage"
        );
        const categoryoffereditexpiry = document.getElementById(
          "categoryoffereditexpiry"
        );

        updatecategoryoffercategory.value = res.category.categoryname; // Set the value of the select element to the category's ID
        updatecategoryofferpercentage.value = categoryofferData.offerAmt;
        categoryoffereditexpiry.value = formatDateandTime(
          new Date(categoryofferData.expiryDate)
        );
      });
  } catch (err) {
    alert(err);
  }
}

function closeCategoryOfferEditModal(categoryEditPoppuWIndow) {
  document.getElementById(categoryEditPoppuWIndow).classList.remove("active");
}
function formatDateandTime(date) {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
  const dd = date.getDate().toString().padStart(2, "0");
  const hh = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
function updateCategoryOffer(event) {
  event.preventDefault();
  const categoryId = localStorage.getItem("categoryofferId");

  const updatecategoryofferpercentage = document.getElementById(
    "updatecategoryofferpercentage"
  );
  const categoryoffereditexpiry = document.getElementById(
    "categoryoffereditexpiry"
  );
  if (!updatecategoryofferpercentage.value) {
    document.getElementById("offerpercentinedit").style.visibility = "visible";
    return;
  } else {
    document.getElementById("offerpercentinedit").style.visibility = "hidden";
  }
  if (
    updatecategoryofferpercentage.value < 1 ||
    updatecategoryofferpercentage.value > 90
  ) {
    document.getElementById("offerpercentinedit").textContent =
      "Must be enter percentage between 1 and 90";
    document.getElementById("offerpercentinedit").style.visibility = "visible";
    return;
  } else {
    document.getElementById("offerpercentinedit").style.visibility = "hidden";
  }
  if (new Date(categoryoffereditexpiry.value) <= new Date()) {
    document.getElementById("offerdateerinedit").style.visibility = "visible";
    document.getElementById("offerdateerinedit").textContent =
      "Please select latest date and time";
    return;
  } else {
    document.getElementById("offerdateerinedit").style.visibility = "hidden";
  }
  const formBody = {
    offerId:categoryId,
    categoryoffer: updatecategoryofferpercentage.value,
    offerexpiry: categoryoffereditexpiry.value,
  };
  fetch("/admin/product/offers/categoryoffer/updatecategoryoffer/", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(formBody),
  })
    .then((response) => response.json())
    .then((res) => {
      if(res.status){
        window.location.href=`http://localhost:5001/admin/product/offers/categoryoffer/`
      }else{
        alert(JSON.stringify(res))
      }
    });
}
