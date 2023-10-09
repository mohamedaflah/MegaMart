
// function handleResponse(id,productid,event){
//     event.preventDefault()
//     fetch(`/users/product/cart/increaseqty/${id}/${productid}/`).then((response)=>{
//         return response.json()
//     }).then((data)=>{
//         console.log(data.status)
//     })
//     event.preventDefault()
// }
let but=document.querySelector('#profile_btn')

but.addEventListener('click',()=>{
    // alert('hel')
    document.querySelector('.prfile').classList.toggle('active')
})