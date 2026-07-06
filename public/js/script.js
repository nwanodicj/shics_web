document.querySelectorAll(".sidebar li[data-section]").forEach(item => {
  item.addEventListener("click", () => {
    const section = item.getAttribute("data-section")

    document.querySelectorAll(".content-section").forEach(sec => {
      sec.classList.remove("active")
    })

    document.getElementById(section).classList.add("active")
  })
})