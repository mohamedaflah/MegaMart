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
