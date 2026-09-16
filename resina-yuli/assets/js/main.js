// Recreación "Resina con Yuli" - interacciones

// Cerrar los demás acordeones al abrir uno (estilo acordeón simple)
document.querySelectorAll("details").forEach(function (detail) {
  detail.addEventListener("toggle", function () {
    if (detail.open) {
      document.querySelectorAll("details").forEach(function (other) {
        if (other !== detail) other.open = false;
      });
    }
  });
});

// Aparecer elementos al hacer scroll (degradado suave)
if ("IntersectionObserver" in window) {
  var reveal = document.querySelectorAll(".section-title, .bonus-item, figure, .testimonials img");
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  reveal.forEach(function (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
}