
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
