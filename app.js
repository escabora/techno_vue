const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    produto: false,
    carrinho: [],
    carrinhoAtivo: false,
    mensagemAlerta: "Item adicionado",
    alertaAtivo: false,
    quantidadeProd: 1,
  },
  filters: {
    numeroPreco(valor) {
      return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
  },
  computed: {
    carrinhoTotal() {
      let total = 0;
      if (this.carrinho.length) {
        this.carrinho.forEach(item => {
          const qtd = item.quantidade * item.preco;
          total += qtd;
        })
      }
      return total;
    },

    carrinhoTotalProds() {
      let total = 0;
      if (this.carrinho.length) {
        this.carrinho.forEach(item => {
          total +=  item.quantidade;
        })
      }
      return total;
    }
  
  },
  methods: {
    fetchProdutos() {
      fetch("./api/produtos.json")
        .then(r => r.json())
        .then(r => {
          this.produtos = r;
        })
    },
    fetchProduto(id) {
      fetch(`./api/produtos/${id}/dados.json`)
        .then(r => r.json())
        .then(r => {
          this.produto = r;
        })
    },
    
    abrirModal(id) {
      this.quantidadeProd = 1;
      this.fetchProduto(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    },
    fecharModal({ target, currentTarget }) {
      if (target === currentTarget) this.produto = false;
    },
    clickForaCarrinho({ target, currentTarget }) {
      if (target === currentTarget) this.carrinhoAtivo = false;
    },
    adicionarItem() {
      if(this.quantidadeProd > this.produto.estoque) {
        this.alerta(`Possuímos apenas ${this.produto.estoque} produtos em estoque`);
        return false;
      }
      this.produto.estoque - this.quantidadeProd;
      const quantidade = this.quantidadeProd;
      const { id, nome, preco } = this.produto;
      this.carrinho.push({ id, nome, preco , quantidade});
      this.alerta(`${nome} adicionado ao carrinho.`);
      this.compararEstoque();
    },
    removerItem(index) {
      this.carrinho.splice(index, 1);
    },
    checarLocalStorage() {
      if (window.localStorage.carrinho)
        this.carrinho = JSON.parse(window.localStorage.carrinho);
    },
    compararEstoque() {
      const items = this.carrinho.filter(({ id }) => id === this.produto.id);
      [...items].map((item)=>{
        this.produto.estoque -= item.quantidade 
      })
      console.log(items);
    },
    alerta(mensagem) {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })

      setTimeout(() => {
        this.mensagemAlerta = mensagem;
        this.alertaAtivo = true;
      }, 300);

      setTimeout(() => {
        this.alertaAtivo = false;
      }, 2500);
    },
    router() {
      const hash = document.location.hash;
      if (hash)
        this.fetchProduto(hash.replace("#", ""));
    }
  },
  watch: {
    produto() {
      document.title = this.produto.nome || "Techno";
      const hash = this.produto.id || "";
      history.pushState(null, null, `#${hash}`);
      if (this.produto) {
        this.compararEstoque();
        console.log("passa aqui ")
      }
    },
    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho);
    },
    
  },
  created() {
    this.fetchProdutos();
    this.router();
    this.checarLocalStorage();
  }
})