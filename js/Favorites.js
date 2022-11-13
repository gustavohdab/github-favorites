import { GithubUser } from "./GithubUser.js";

// classe que vai conter a lógica dos dados
// como os dados serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.loadFavorite()

    GithubUser.search("diego3g").then(user => console.log(user))
  }

  loadFavorite() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
  }

  saveFavorite() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
  }

  async addFavorite(username) {
    const userExists = this.entries.find(entry => entry.login === username)

    if (userExists) return alert("Usuário já está nos favoritos")

    try {
      const user = await GithubUser.search(username)

      if (!user.login) {
        throw new Error("Usuário não encontrado")
      }

      this.entries = [user, ...this.entries]
      this.render()
      this.saveFavorite()

    } catch (error) {
      alert(error.message)
    }
  }

  // high order function (map, filter, reduce)~~
  deleteFavorite(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)
    this.entries = filteredEntries
    this.render()
    this.saveFavorite()
  }
}

// classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    this.tbody = this.root.querySelector("tbody")
    this.render()
    this.onAddFavorite()
  }

  onAddFavorite() {
    const addButton = this.root.querySelector(".search button")
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input")

      this.addFavorite(value)
    }
  }

  render() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const tr = this.createRow()
      tr.querySelector(".user img").src = `https://github.com/${user.login}.png`
      tr.querySelector(".user img").alt = `Imagem do usuário ${user.name}`
      tr.querySelector(".user a").href = `https://github.com/${user.login}`
      tr.querySelector(".user a p").textContent = user.name
      tr.querySelector(".user a span").textContent = user.login
      tr.querySelector(".repositories p").textContent = user.public_repos
      tr.querySelector(".followers p").textContent = user.followers
      tr.querySelector(".btn-remove").addEventListener("click", () => {
        const isOk = confirm("Deseja mesmo remover esse usuário dos favoritos?")
        if (isOk) {
          this.deleteFavorite(user)
        }
      })
      this.tbody.appendChild(tr)
    })
  }

  createRow() {
    const tr = document.createElement("tr")

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/gustavohdab.png" alt="" />
        <a href="https://github.com/gustavohdab" target="_blank">
          <p>Gustavo</p>
          <span>gustavohdab</span>
        </a>
      </td>
      <td class="repositories">
        <p>10</p>
      </td>
      <td class="followers">
        <p>10</p>
      </td>
      <td>
        <button class="btn-remove">&times;</button>
      </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr")
      .forEach((tr) => {
        tr.remove()
      })
  }
}