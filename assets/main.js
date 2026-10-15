/**
 * علیرضا غلامی - وب‌سایت مشاوره کنکور تجربی
 * Core JavaScript Logic for Navigation, Telegram Messaging & Accordion
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initFAQAccordions();
  initConsultationForm();
  initContactForm();
});

// 1. Header scroll effect
function initNavbar() {
  const header = document.querySelector('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// 2. Mobile Menu Drawer
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('mobile-menu-backdrop');

  if (!menuBtn || !mobileMenu) return;

  const openMenu = () => {
    mobileMenu.classList.remove('hidden');
    // Force reflow for CSS transition
    void mobileMenu.offsetWidth;
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
      document.body.style.overflow = '';
    }, 250);
  };

  menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  // Close when clicking mobile links
  const links = mobileMenu.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// 3. FAQ Accordions
function initFAQAccordions() {
  const toggles = document.querySelectorAll('.faq-toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', function () {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      const content = this.nextElementSibling;
      const icon = this.querySelector('.faq-icon');

      // Close other accordions in the same container
      const parent = this.closest('.faq-container') || document;
      parent.querySelectorAll('.faq-toggle').forEach(otherToggle => {
        if (otherToggle !== this) {
          otherToggle.setAttribute('aria-expanded', 'false');
          const otherContent = otherToggle.nextElementSibling;
          if (otherContent) otherContent.classList.add('hidden');
          const otherIcon = otherToggle.querySelector('.faq-icon');
          if (otherIcon) otherIcon.classList.remove('rotate-180');
        }
      });

      if (isExpanded) {
        this.setAttribute('aria-expanded', 'false');
        if (content) content.classList.add('hidden');
        if (icon) icon.classList.remove('rotate-180');
      } else {
        this.setAttribute('aria-expanded', 'true');
        if (content) content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });
}

// 4. Consultation Form (on products.html / consultation page)
function initConsultationForm() {
  const form = document.getElementById('consultation-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = (document.getElementById('student-name') || {}).value?.trim() || '';
    const phone = (document.getElementById('student-phone') || {}).value?.trim() || '';
    const gradeElem = document.getElementById('grade-select');
    const grade = gradeElem ? gradeElem.options[gradeElem.selectedIndex].text : '';
    const serviceElem = document.getElementById('service-type');
    const service = serviceElem ? serviceElem.options[serviceElem.selectedIndex].text : '';
    const notes = (document.getElementById('notes') || {}).value?.trim() || '';

    if (!name || !phone) {
      alert('لطفاً نام و شماره تماس یا آیدی تلگرام خود را وارد نمایید.');
      return;
    }

    const message = 
`سلام علیرضا وقت بخیر،
درخواست مشاوره کنکور تجربی از وب‌سایت:

👤 نام و نام خانوادگی: ${name}
📞 راه ارتباطی: ${phone}
🎓 پایه تحصیلی: ${grade}
📌 نوع خدمت: ${service}
${notes ? `📝 توضیحات و وضعیت فعلی:\n${notes}` : ''}`;

    const feedback = document.getElementById('form-feedback');
    const resultBox = document.getElementById('form-result-box');
    const messagePreview = document.getElementById('form-message-preview');
    const copyBtn = document.getElementById('form-copy-btn');
    const tgBtn = document.getElementById('form-tg-btn');

    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.classList.add('flex');
    }

    if (resultBox && messagePreview) {
      messagePreview.textContent = message;
      resultBox.classList.remove('hidden');

      if (tgBtn) {
        const encoded = encodeURIComponent(message);
        tgBtn.href = `https://t.me/MrHandy?text=${encoded}`;
      }

      if (copyBtn) {
        copyBtn.onclick = function () {
          navigator.clipboard.writeText(message).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">done</span><span>کپی شد!</span>';
            setTimeout(() => {
              copyBtn.innerHTML = originalText;
            }, 3000);
          });
        };
      }

      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      // Direct prompt if preview container doesn't exist
      const encoded = encodeURIComponent(message);
      window.open(`https://t.me/MrHandy?text=${encoded}`, '_blank');
    }
  });
}

// 5. Contact Form (on contact.html)
function initContactForm() {
  const form = document.getElementById('consultationForm');
  if (!form) return;

  const resultModal = document.getElementById('resultModal');
  const formattedMessageText = document.getElementById('formattedMessageText');
  const copyMessageBtn = document.getElementById('copyMessageBtn');
  const copyButtonText = document.getElementById('copyButtonText');
  const tgDirectBtn = document.getElementById('telegramDirectBtn');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = (document.getElementById('fullName') || {}).value?.trim() || '';
    const contact = (document.getElementById('contactInfo') || {}).value?.trim() || '';
    const grade = (document.getElementById('grade') || {}).value || '';
    const topic = (document.getElementById('topic') || {}).value || '';
    const desc = (document.getElementById('description') || {}).value?.trim() || '';

    if (!name || !contact) {
      alert('لطفاً نام و راه ارتباطی خود را وارد نمایید.');
      return;
    }

    const generatedMessage = 
`سلام علیرضا وقت بخیر،
درخواست مشاوره از طریق وب‌سایت:

👤 نام و نام خانوادگی: ${name}
📞 راه ارتباطی: ${contact}
🎓 پایه تحصیلی: ${grade}
📌 موضوع درخواست: ${topic}
${desc ? `📝 توضیحات وضعیت:\n${desc}` : '📝 توضیحات: ثبت نشده'}`;

    if (formattedMessageText) {
      formattedMessageText.textContent = generatedMessage;
    }

    if (tgDirectBtn) {
      const encoded = encodeURIComponent(generatedMessage);
      tgDirectBtn.href = `https://t.me/MrHandy?text=${encoded}`;
    }

    if (resultModal) {
      resultModal.classList.remove('hidden');
      resultModal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  if (copyMessageBtn && formattedMessageText) {
    copyMessageBtn.addEventListener('click', function () {
      const textToCopy = formattedMessageText.textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (copyButtonText) copyButtonText.textContent = 'متن کپی شد!';
        copyMessageBtn.classList.add('bg-secondary-container', 'text-primary');
        setTimeout(() => {
          if (copyButtonText) copyButtonText.textContent = 'کپی متن پیام';
          copyMessageBtn.classList.remove('bg-secondary-container', 'text-primary');
        }, 3000);
      });
    });
  }
}
