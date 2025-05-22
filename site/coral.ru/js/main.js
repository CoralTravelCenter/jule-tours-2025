import {hostReactAppReady, mediaMatcher} from "../../common/js/utils";

(async () => {
  await hostReactAppReady();

  function scrollToSection(sectionName) {
    const target = document.querySelector(`[data-section="${sectionName}"]`);
    if (target) {
      target.scrollIntoView({behavior: "smooth", block: "start"});
    }
  }

  // --- Mobile Navigation ---

  function handleSelectToggle(event, select, itemsContainer) {
    event.stopPropagation();
    select.classList.toggle("active");
    itemsContainer.classList.toggle("select-hide");
  }

  function handleOutsideClick(select, itemsContainer) {
    select.classList.remove("active");
    itemsContainer.classList.add("select-hide");
  }

  function handleItemSelect(event, select, selected, items, itemsContainer) {
    event.stopPropagation();
    const item = event.target.closest(".select-item");
    if (!item) return;

    items.forEach(i => i.classList.remove("selected"));
    item.classList.add("selected");
    selected.textContent = item.textContent;

    select.classList.remove("active");
    itemsContainer.classList.add("select-hide");

    const value = item.getAttribute("data-value");
    select.dispatchEvent(new CustomEvent("select-change", {detail: {value}}));
  }

  function handleSelectChange(event) {
    scrollToSection(event.detail.value);
  }

  function setupMobileNavigation() {
    const select = document.querySelector(".custom-select");
    const selected = select.querySelector(".select-selected");
    const itemsContainer = select.querySelector(".select-items");
    const items = select.querySelectorAll(".select-item");

    selected.addEventListener("click", (e) => handleSelectToggle(e, select, itemsContainer));
    document.addEventListener("click", () => handleOutsideClick(select, itemsContainer));
    itemsContainer.addEventListener("click", (e) => handleItemSelect(e, select, selected, items, itemsContainer));
    select.addEventListener("select-change", handleSelectChange);
  }

  // --- Desktop Navigation ---

  function handleNavClick(event, navItems) {
    navItems.forEach(i => i.classList.remove("active"));
    event.currentTarget.classList.add("active");

    const section = event.currentTarget.getAttribute("data-country");
    scrollToSection(section);
  }

  function observeSections(navItems) {
    const sections = document.querySelectorAll("[data-section]");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.6) return;

        const sectionName = entry.target.getAttribute("data-section");

        navItems.forEach(item => {
          item.classList.toggle("active", item.getAttribute("data-country") === sectionName);
        });
      });
    }, {
      threshold: 0.6
    });

    sections.forEach(section => observer.observe(section));
  }

  function setupDesktopNavigation() {
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
      item.addEventListener("click", (e) => handleNavClick(e, navItems));
    });

    observeSections(navItems);

    const anchorSection = document.querySelector("section.anchor-links");

    if (anchorSection?.parentElement?.parentElement) {
      const stickyContainer = anchorSection.parentElement.parentElement;
      Object.assign(stickyContainer.style, {
        position: "sticky",
        top: "16px",
        zIndex: 10
      });
    }

  }

  // --- Media Query Handling ---

  mediaMatcher(768, (isMobile) => {
    if (isMobile) {
      setupMobileNavigation();
    } else {
      setupDesktopNavigation();
    }
  });
})();
