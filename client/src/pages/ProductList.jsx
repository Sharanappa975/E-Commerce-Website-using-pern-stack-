import { Card, Pagination } from "@windmill/react-ui";
import Product from "components/Product";
import Spinner from "components/Spinner";
import { useProduct } from "context/ProductContext";
import Layout from "layout/Layout";
import { Link } from "react-router-dom";

const ProductList = () => {
  const { products, setPage } = useProduct();

  const handleChange = (page) => {
    setPage(page);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  if (!products) {
    return (
      <>
        <Layout>
          <Spinner size={100} loading />
        </Layout>
      </>
    );
  }

  return (
    <Layout>
      <div className="container py-20 mx-auto space-y-4">
        <div className="grid grid-cols-1 gap-3 mx-2 sm:grid-cols-2">
          <Card className="p-4">
            <h2 className="text-lg font-semibold">AI Recommendations</h2>
            <p className="text-sm text-gray-600">
              Get personalized product suggestions based on your description.
            </p>
            <Link
              to="/ai-recommendations"
              className="inline-block mt-3 text-sm text-purple-700 font-semibold"
            >
              Try AI Recommendations
            </Link>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold">Semantic Search</h2>
            <p className="text-sm text-gray-600">
              Search by meaning, not only keywords.
            </p>
            <Link
              to="/semantic-search"
              className="inline-block mt-3 text-sm text-blue-700 font-semibold"
            >
              Open Semantic Search
            </Link>
          </Card>
        </div>

        <Card className="flex flex-wrap h-full mx-2">
          {products?.map((prod) => (
            <div
              className="w-full flex flex-col justify-between sm:w-1/2 md:w-1/3 lg:w-1/4 my-2 px-2 box-border"
              key={prod.product_id}
            >
              <Product product={prod} />
            </div>
          ))}
        </Card>

        <Pagination
          totalResults={20}
          resultsPerPage={12}
          onChange={handleChange}
          label="Page navigation"
        />
      </div>
    </Layout>
  );
};

export default ProductList;
