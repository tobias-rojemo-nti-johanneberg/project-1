const ingredients = document
  .getElementById("ingredient-data")
  .innerHTML.split("§§")
  .map((ingredient) => {
    const data = ingredient.split("§");
    return { id: Number(data[0]), name: data[1], price: Number(data[2]) };
  });

const pizzas = document
  .getElementById("pizza-data")
  .innerHTML.split("§§")
  .map((pizza) => {
    const data = pizza.split("§");
    return {
      id: Number(data[0]),
      name: data[1],
      ingredients: Number(data[2]),
      price: Number(data[3]),
    };
  });

const familyBit =
  1 << ingredients.find((ingredient) => ingredient.name == "Familjepizza").id;

const order =
  localStorage
    .getItem("order")
    ?.split("§§")
    ?.map((pizza) => {
      const data = pizza.split("§");
      return {
        id: data[0],
        name: data[1],
        ingredients: Number(data[2]),
        price: Number(data[3]),
      };
    }) || [];

const main = document.querySelector("main");

order.forEach((pizza, i) => {
  const elem = document.createElement("div");
  elem.id = i;

  const img = document.createElement("img");
  img.src = `/img/${pizza.id}.svg`;

  const h = document.createElement("h2");
  h.innerHTML = pizza.name;

  const span = document.createElement("span");
  span.innerHTML = `${calcPrice(pizza)}:-`;

  const ul = document.createElement("ul");

  ingredients
    .filter(
      (ingredient) =>
        (pizzas[pizza.id - 1].ingredients & (1 << ingredient.id)) > 0
    )
    .forEach((ingredient) => {
      const li = document.createElement("li");
      li.innerHTML = ingredient.name;
      ul.appendChild(li);
    });

  const options = document.createElement("div");
  options.classList.add("options");
  ingredients.slice(0, 2).forEach((ingredient) => {
    appendBox(
      options,
      i,
      ingredient,
      pizza.ingredients & (1 << ingredient.id),
      true,
      pizza,
      span
    );
  });

  const toggles = document.createElement("div");
  toggles.classList.add("toggles");

  ingredients.slice(2).forEach((ingredient) => {
    appendBox(
      toggles,
      i,
      ingredient,
      pizza.ingredients & (1 << ingredient.id),
      (pizzas[pizza.id - 1].ingredients & (1 << ingredient.id)) == 0,
      pizza,
      span
    );
  });

  const remove = document.createElement("button");
  remove.classList.add("remove");
  remove.innerHTML = "Remove";
  remove.addEventListener("click", () => {
    order.splice(i, 1);
    if (order.length == 0) localStorage.removeItem("order");
    else
      localStorage.setItem(
        "order",
        order
          .map((x) => `${x.id}§${x.name}§${x.ingredients}§${x.price}`)
          .join("§§")
      );
    location.reload();
  });

  elem.appendChild(img);
  elem.appendChild(h);
  elem.appendChild(span);
  elem.appendChild(ul);
  elem.appendChild(options);
  elem.appendChild(toggles);
  elem.appendChild(remove);

  main.appendChild(elem);
});

const match = location.href.match(/#(\d+)/);

if (match) {
  setTimeout(() => {
    document.getElementById(match[1]).scrollIntoView({ behavior: "smooth" });
  }, 100);
}

function appendBox(list, i, ingredient, enabled, showPrice, pizza, priceElem) {
  const box = document.createElement("input");
  box.type = "checkbox";
  box.id = `${i}-${ingredient.id}`;
  box.checked = enabled;
  const label = document.createElement("label");
  label.for = `${i}-${ingredient.id}`;
  if (ingredient.name == "Familjepizza") {
    label.innerHTML = `${ingredient.name} - x2`;
  } else if (ingredient.price == 0 || !showPrice) {
    label.innerHTML = `${ingredient.name}`;
  } else {
    label.innerHTML = `${ingredient.name} - ${ingredient.price / 100}:-`;
  }

  box.addEventListener("click", () => {
    order[i].ingredients ^= 1 << ingredient.id;
    localStorage.setItem(
      "order",
      order
        .map((x) => `${x.id}§${x.name}§${x.ingredients}§${x.price}`)
        .join("§§")
    );
    priceElem.innerHTML = `${calcPrice(pizza)}:-`;
  });

  list.appendChild(box);
  list.appendChild(label);
}

function calcPrice(pizza) {
  return (
    ((pizza.price +
      ingredients
        .filter((ingredient) => (pizza.ingredients & (1 << ingredient.id)) > 0)
        .filter(
          (ingreditent) =>
            (pizzas[pizza.id - 1].ingredients & (1 << ingreditent.id)) == 0
        )
        .map((x) => x.price)
        .reduce((a, b) => a + b, 0)) /
      100) *
    ((pizza.ingredients & familyBit) > 0 ? 2 : 1)
  );
}
