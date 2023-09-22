(function () {
  let menubar = document.querySelector(".menu");
  let link=document.querySelector('.links')
  menubar.addEventListener('click',()=>{
    link.classList.toggle('active')
  })
})();
