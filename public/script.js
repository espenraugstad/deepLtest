const translateBtn = document.getElementById("translateBtn");

window.addEventListener("load", async () => {
  console.log("Loaded");
  const pagesRes = await fetch("/pages");
  const files = await pagesRes.json();
  const pages = JSON.parse(files)

  const newLinks = document.getElementById("newLinks");

  if(pages.length > 0){
    translateBtn.disabled = true;
  }

  for (const page of pages) {
    const a = document.createElement("a");
    a.href = `./results/${page}`;
    a.innerText = page;
    newLinks.appendChild(a);
  }
});


translateBtn.addEventListener("click", async () => {
  const sd = document.querySelector("._smartdesigner");

  const res = await fetch("/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      html: sd.outerHTML,
    }),
  });
  console.log(res);
  const data = await res.json();

  if (!data.fileName) return;
  console.log("Creating links");

  const newLinks = document.getElementById("newLinks");
  const a = document.createElement("a");
  a.href = `./results/${data.fileName}`;
  a.innerText = data.fileName;
  newLinks.appendChild(a);

  translateBtn.disabled = true;
});
