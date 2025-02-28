import React, { useEffect, useState } from "react";
import { fetchProdutos } from "../api/instance";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { Link, useParams, useNavigate } from "react-router-dom";
import './ProductList.css'


import banner from "../assets/header-produtos.jpg";

export default function ProductsList() {
  const { categoria } = useParams(); // Captura o parâmetro de URL
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16); // Quantidade de itens por página
  const [selectedCategories, setSelectedCategories] = useState([]); // Categorias selecionadas
  const [filterOption, setFilterOption] = useState(""); // Filtro de condição (Novo / Usado) ou Ordenação
  const [sortBy, setSortBy] = useState(""); // Ordenação

  // Busca os produtos da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProdutos();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtra os produtos por categoria, condição e ordenação
  useEffect(() => {
    let filtered = [...products];

    // Filtra por categorias selecionadas
   
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.some((category) => category.trim() === decodeURIComponent(product.category.trim()))
      );
    }

    // Filtra por condição (novo ou usado)
    if (filterOption === "New" || filterOption === "Used") {
      filtered = filtered.filter((product) => product.condition === filterOption);
    }

    // Ordenação por preço
    if (sortBy === "price_asc") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Resetar para a primeira página após filtrar/ordenar
  }, [selectedCategories, filterOption, sortBy, products]);

  // Aplica o filtro inicial baseado no parâmetro de URL
  useEffect(() => {
    if (categoria) {
      // Converte a categoria da URL para o formato usado nos produtos
      const formattedCategory = categoria.charAt(0).toUpperCase() + categoria.slice(1);
      setSelectedCategories([formattedCategory]); // Atualiza a categoria selecionada
    }
  }, [categoria]);

  // Atualiza os produtos exibidos na página atual
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const navigate = useNavigate(); 

  // Função para mudar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Função para lidar com a seleção de categorias
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category) // Remove a categoria se já estiver selecionada
        : [...prev, category] // Adiciona a categoria se não estiver selecionada
    );
  };

  // Função para lidar com a mudança na quantidade de itens por página
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Resetar para a primeira página
  };

  // Função para lidar com a ordenação e filtro de condição
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterOption(value);
    if (value === "price_asc" || value === "price_desc") {
      setSortBy(value); // Ordenação por preço
    } else {
      setSortBy(""); // Limpar ordenação quando escolher "Novo" ou "Usado"
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 text-center">
          <p>Carregando produtos...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 text-center">
          <p className="text-red-500">Erro: {error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-[90px]">
        <div className="relative mb-8">
          <img
            src={banner}
            alt="Banner de Produtos"
            className="w-full h-48 object-cover rounded-lg"
          />
          <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-white text-center">
            Produtos
          </h1>
        </div>

        {/* Controles de Exibição e Ordenação - Desktop */}
        <div className="hidden sm:flex flex-row justify-end items-center mb-6 gap-4">
          <div className="flex gap-4">
            <select
              value={filterOption}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            >
              <option value="" disabled>
                Ordenar por
              </option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="New">Novo</option>
              <option value="Used">Usado</option>
            </select>
          </div>
        </div>

        {/* Filtros e Cards de Produtos */}
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          {/* Filtros */}
          <div className="">
            <div className="block sm:hidden mb-4 flex justify-center gap-4">
              {/* Exibe o select para categorias e ordenação em telas menores */}
              <select
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">Filtrar por Categoria</option>
                {["Moda Masculina", "Moda Feminina", "Acessórios", "Calçados"].map(
                  (category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  )
                )}
              </select>

              <select
                value={filterOption}
                onChange={handleFilterChange}
                className="p-2 border rounded"
              >
                <option value="" disabled>
                  Ordenar por
                </option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="New">Novo</option>
                <option value="Used">Usado</option>
              </select>
            </div>

            <div className="hidden sm:block bg-[var(--neutral-alt)] p-4 rounded-lg">
              {/* Exibe os checkboxes em telas maiores */}
              <h2 className="font-bold mb-2">Filtrar por:</h2>
              {["Moda Masculina", "Moda Feminina", "Acessórios", "Calçados"].map(
                (category) => (
                  <label key={category} className="block mb-2">
                    <input
                      type="checkbox"
                      value={category}
                      onChange={() => handleCategoryChange(category)}
                      checked={selectedCategories.includes(category)} // Marca o checkbox se a categoria estiver selecionada
                      className="mr-2"
                    />
                    {category}
                  </label>
                )
              )}
            </div>
          </div>

          {/* Coluna de Cards de Produtos */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
              {currentProducts.map((product, index) => (
                <Link
                  to={`/produto/${product.id}`}
                  key={index}
                  className="w-full px-2"
                >
                  <ProductCard
                    id={product.id}
                    image={product.image}
                    name={product.name}
                    description={product.category}
                    price={product.price}
                    size="small"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Paginação */}
        <div className="py-8 flex justify-center space-x-2">
          {Array.from(
            { length: Math.ceil(filteredProducts.length / itemsPerPage) },
            (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === i + 1
                    ? "bg-[var(--primary-color)] text-white cursor-pointer"
                    : "bg-gray-200 text-gray-700 hover:bg-[#FBE9E7] cursor-pointer"
                }`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
}