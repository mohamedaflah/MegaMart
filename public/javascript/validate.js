// function handleResponse(id,productid,event){
//     event.preventDefault()
//     fetch(`/users/product/cart/increaseqty/${id}/${productid}/`).then((response)=>{
//         return response.json()
//     }).then((data)=>{
//         console.log(data.status)
//     })
//     event.preventDefault()
// }
let but = document.querySelector("#profile_btn");

but.addEventListener("click", () => {
  // alert('hel')
  document.querySelector(".prfile").classList.toggle("active");
});
function displayProfileImage(inputDom,imgDom){
  // alert('h')
  const input=document.getElementById(inputDom)
  const img=document.getElementById(imgDom)
  if(input.files && input.files[0]){
      const reader=new FileReader()

      reader.onload=(e)=>{
          img.src=e.target.result
      }
      reader.readAsDataURL(input.files[0])
  }else{
      img.src=''
  }
}
// async function changeQty(user_id, product_id, qty,changeType) {
//   try {
//     if(changeType=='increase'){
//       const response = await fetch(`/users/product/cart/increaseqty/${user_id}/${product_id}`);
//       if (response.ok) {
//         const qtyDisplay = document.getElementById("qty_display");
//         const currentQty = parseInt(qtyDisplay.textContent, 10) || 0;
//         const newQty = currentQty + 1;
//         qtyDisplay.textContent = newQty < 10 ? `0${newQty}` : newQty.toString();
//       }
//     }else if(changeType=='decrease'){
//       let invisible=document.getElementById('visible')
//       // if(Number(qty)<=1){
//       //   invisible.style.visibility="hidden"
//       //   return
//       // }else{
//       //   invisible.style.visibility="visible"
//       // }
//       const response=await fetch(`/users/product/cart/decreaseqty/${user_id}/${product_id}/`)
//       if(response.ok){
//         const qtyDisplay = document.getElementById("qty_display");
//         const currentQty = parseInt(qtyDisplay.textContent, 10) || 0;
//         const newQty = currentQty - 1;
//         qtyDisplay.textContent = newQty < 10 ? `0${newQty}` : newQty.toString();
//       }
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }