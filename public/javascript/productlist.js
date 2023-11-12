const rangeInput = document.querySelectorAll(".range-input input"),
  priceInput = document.querySelectorAll(".price-input input"),
  range = document.querySelector(".slider .progress");
let priceGap = 1000;

priceInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minPrice = parseInt(priceInput[0].value),
      maxPrice = parseInt(priceInput[1].value);

    if (maxPrice - minPrice >= priceGap && maxPrice <= rangeInput[1].max) {
      if (e.target.className === "input-min") {
        rangeInput[0].value = minPrice;
        range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
      } else {
        rangeInput[1].value = maxPrice;
        range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
      }
    }
  });
});

rangeInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minVal = parseInt(rangeInput[0].value),
      maxVal = parseInt(rangeInput[1].value);

    if (maxVal - minVal < priceGap) {
      if (e.target.className === "range-min") {
        rangeInput[0].value = maxVal - priceGap;
      } else {
        rangeInput[1].value = minVal + priceGap;
      }
    } else {
      priceInput[0].value = minVal;
      priceInput[1].value = maxVal;
      range.style.left = (minVal / rangeInput[0].max) * 100 + "%";
      range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
    }
  });
});
// document.querySelectorAll('input[name="category"], input[name="brand"], .input-min, .input-max, input[name="sort"]').forEach(element=>{
//   console.log(JSON.stringify(element))
//   element.addEventListener('input', updateProducts);
// })
// function updateProducts(){
//   try{

//     const category = document.querySelector('input[name="category"]:checked').value;
//     const brand = document.querySelector('input[name="brand"]:checked').value;
//     const minPrice = document.querySelector('.input-min').value;
//     const maxPrice = document.querySelector('.input-max').value;
//     const sortBy = document.querySelector('input[name="sort"]:checked').value;

//     alert(category,brand,minPrice,maxPrice,sortBy)
//   }catch(err){
//     alert(err)
//   }
// }
// document.getElementById("sfs").addEventListener("input",updateProducts)
// function updateProducts(event){
//   event.preventDefault()
//   alert(JSON.stringify(new FormData(even)))

// }
document.addEventListener("DOMContentLoaded", () => {
  const updateProductList = () => {
    const categories = Array.from(
      document.querySelectorAll('input[name="category"]:checked')
    ).map((checkbox) => checkbox.value);
    const brands = Array.from(
      document.querySelectorAll('input[name="brand"]:checked')
    ).map((checkbox) => checkbox.value);
    // const sortedByPrice=document.querySelectorAll('input[name="sortprice"]:checked')?.value || '';
    const sortedBy =
      document.querySelector('input[name="sort"]:checked')?.value || "";
    // alert(`
    //   category=${categories}
    //   brand=${brands}
    //   sort=${sortedBy}
    //   `);
    fetch(
      `/users/product/filtereandsort/?category=${categories.join(
        ","
      )}&brand=${brands.join(",")}&sort=${sortedBy}`
    )
      .then((response) => response.json())
      .then((res) => {
        console.log(JSON.stringify(res.data))
        let allCard=[]
        const id=localStorage.getItem("userId")
        res.data.forEach((product)=>{
          if(!product.deletionStatus){
            let card=`
            <a class="col-xl-2 col-lg-3 col-md-4 col-sm-6 d-flex justify-content-center text-decoration-none text-dark" onclick="window.location.href='/products/product-detail/${product._id}/mainimage'">
            <div class="card d-flex flex-column justify-content-between position-relative" style="width: 12rem;height: 15rem;box-shadow: 0px 1px 13px 0px rgba(0, 0, 0, 0.156);border: none;">
                ${product.stock < 1 ? 
                    `<span style="font-size: 12px;padding:2px;background: rgba(255, 0, 0, 0.224);width: 90px;margin: 2px;border-radius: 30px;display: flex;align-items: center;justify-content: center;" class="text-white">out of stock</span>` 
                    : `<span style="visibility:hidden;font-size: 12px;padding:2px;background: rgba(255, 0, 0, 0.224);width: 90px;margin: 2px;border-radius: 30px;display: flex;align-items: center;justify-content: center;" class="text-white"></span>`}
                <div class="img d-flex justify-content-center" style="border-bottom: 1px solid rgb(205, 205, 205);height: 6rem;">
                    <img src="/product-images/${product.image[0].mainimage}" style="height: 80%;width: auto;" alt="" class="card-top-img mt-2">
                </div>
                <div class="px-2">
                    <span style="font-size: 13px;">${product.productName}</span>
                </div>
                <div class="px-2 d-flex justify-content-between">
                    <span style="font-size: 13px;">
                        ${product.discount ? `₹${product.discount}` : `₹${product.price}`}
                    </span>
                    <span style="font-size: 13px;text-decoration: line-through;">
                        ${product.discount ? `₹${product.price}` : ''}
                    </span>
                </div>
                <div class="px-2 d-flex justify-content-between mb-2">
                    ${product.stock < 1 ? 
                        `<button class="btn-dark m-0 py-1 px-3 disabled" style="font-size: 12px;background: rgba(107, 105, 105, 0.818);cursor: no-drop;" disabled>Add to cart</button>` 
                        : `<button class="btn-dark m-0 py-1 px-3" style="font-size: 12px;" ${id ? '' : 'onclick="window.location.href=\'/user/login\'"'}>Add to cart</button>`}
                    ${id ? `<button class="btn-dark m-0 py-1 px-2" style="font-size: 15px;"><i class="fa fa-heart"></i></button>` : ''}
                </div>
            </div>
        </a>`
        allCard.push(card)
          }
        })
        const cardConverted=allCard.join('')
        if(cardConverted.length>0){
          document.getElementById("displayData").innerHTML=cardConverted
        }else{
          document.getElementById("displayData").innerHTML=`<h3>data not found</h3>`
        }
      });
  };

  document
    .querySelectorAll(
      'input[name="category"],input[name="brand"],input[name="sort"]'
    )
    .forEach((input) => {
      input.addEventListener("change", updateProductList);
    });
});
