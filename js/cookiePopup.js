let data;

const cookieWrapper = {
  getItem: (key) => {
    const cookies = document.cookie
      .split(';')
      .map(cookie => cookie.split('='))
      .reduce((acc, [key, value]) => ({ ...acc, [key.trim()]: value}), {});
    return cookies[key]
  },
  setItem: (key, value, expires) => {
    document.cookie = `${key}=${value}; expires=${expires}`
  }
}

const saveConsent = (status) => {
  // ID + t-true/f-false
  const dataToSave = data.map( v => `${v.id}${(v.consent && status) ? 't': 'f'}`).join(',');
  const expireTime = new Date().getTime() + 10000;
  // const expireTime = new Date().getTime() + 1000 * 3600 * 24;
  cookieWrapper.setItem("vendors", dataToSave, new Date(expireTime).toUTCString())

  document.querySelector("main").classList.toggle("blur");
  document.querySelector(".header").classList.toggle("blur");
  document.querySelector("body").classList.toggle("lock-scroll");
  document.querySelector(".cookie-popup").style.display = "none";
}

const setBgBlurAndLockScroll = () => {
  document.querySelector("main").classList.toggle("blur");
  document.querySelector(".header").classList.toggle("blur");
  document.querySelector("body").classList.toggle("lock-scroll");
}

const fetchData = async () => {
  const vendorsData = await fetch('https://optad360.mgr.consensu.org/cmp/v2/vendor-list.json')
  .then(response => response.json())
  .then(data => data.vendors)
  .then(vendors => Object.values(vendors))
  .catch((error) => {
    console.error('Error:', error);
  });

  return vendorsData;
}

const createItem = (name, url, id, data) => {
  const item = document.createElement("div")
  item.classList.add("cookie-popup__item")

  const itemTitle = document.createElement("p")
  itemTitle.innerText = name;
  const itemUrl = document.createElement("a")
  itemUrl.innerText = "Policy"
  itemUrl.href = url
  itemUrl.target = "_blank"
  const wrapper = document.createElement("div")
  wrapper.classList.add("cookie-popup__wrapper")
  wrapper.appendChild(itemTitle)
  wrapper.appendChild(itemUrl)
  item.appendChild(wrapper)

  const toggle = document.createElement("label")
  toggle.classList.add("cookie-popup__toggle")
  const input = document.createElement("input")
  input.classList.add("cookie-popup__checkbox")
  input.type = "checkbox"
  input.checked = true
  input.addEventListener('change', (e) => {
    data[id].consent = e.target.checked ? true : false;
  })
  const slider = document.createElement("span")
  slider.classList.add("cookie-popup__slider")
  toggle.appendChild(input)
  toggle.appendChild(slider)
  item.appendChild(toggle)
  
  return item; 
}

const setPopup = async () => {
  const body = document.querySelector("body")
  setBgBlurAndLockScroll()
  
  const popup = document.createElement("div")
  popup.classList.add("cookie-popup")
  body.appendChild(popup)
  
  const content = document.createElement("div")
  content.classList.add("cookie-popup__container")
  popup.appendChild(content)

  const title = document.createElement("h1")
  title.classList.add("cookie-popup__title")
  title.innerText = "GDPR consent"
  content.appendChild(title)

  const list = document.createElement("div")
  list.classList.add("cookie-popup__list")
  content.appendChild(list)

  const consent = document.createElement("div")
  const accept = document.createElement("button")
  accept.classList.add("cookie-popup__btn")
  accept.classList.add("cookie-popup__btn_accept")
  accept.innerText = "Accept"
  accept.addEventListener('click', () => {
    saveConsent(true);
  })
  const reject = document.createElement("button")
  reject.classList.add("cookie-popup__btn")
  reject.classList.add("cookie-popup__btn_reject")
  reject.innerText = "Reject"
  reject.addEventListener('click', () => {
    saveConsent(false);
  })
  consent.classList.add("cookie-popup__consent")
  consent.appendChild(accept)
  consent.appendChild(reject)
  content.appendChild(consent)


  data = await fetchData()
  data = data.map( v => {return {id: v.id, name: v.name, policyUrl: v.policyUrl, consent: true}})
  data.forEach((vendor, index) => list.appendChild(createItem(vendor.name, vendor.policyUrl, index, data)))
}

window.addEventListener('DOMContentLoaded', () => {
  !cookieWrapper.getItem("vendors") && setPopup();
})