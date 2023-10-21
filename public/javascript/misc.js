async function addToCart(id){
    // /users/product/add-to-cart/<%-data._id%>
    const response=await fetch(`/users/product/add-to-cart/${id}`).then((re)=>{
        return re.json()
    })
    if(response.status){
        let ct=document.getElementById("cartCnt")
        let current=ct.textContent;
        ct.textContent=Number(current)+1
    }
}
