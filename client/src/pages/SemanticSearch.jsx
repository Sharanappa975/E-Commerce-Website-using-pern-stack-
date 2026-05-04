import { Card } from "@windmill/react-ui";
import Product from "components/Product";
import Spinner from "components/Spinner";
import Layout from "layout/Layout";
import { useMemo, useState } from "react";
import API from "../api/axios.config";

const SEMANTIC_SEARCH_ENDPOINT = "/ai/search";

const SemanticSearch = () => {
  const [semanticQuery, setSemanticQuery] = useState("");
  const [semanticProducts, setSemanticProducts] = useState([]);
  const [isSemanticLoading, setIsSemanticLoading] = useState(false);
  const [semanticError, setSemanticError] = useState("");

  const semanticPrompts = useMemo(
    () => [
      "lightweight laptop for travel",
      "minimalist wooden desk",
      "noise canceling headphones",
      "budget smartphone with good camera",
      "coffee grinder for espresso",
    ],
    []
  );

  const handleSemanticSearch = async () => {
    const trimmed = semanticQuery.trim();
    if (!trimmed) {
      setSemanticError("Please enter a semantic search query.");
      return;
    }

    try {
      setSemanticError("");
      setIsSemanticLoading(true);
      const res = await API.post(SEMANTIC_SEARCH_ENDPOINT, { query: trimmed });
      setSemanticProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
      setSemanticError("We could not fetch semantic results. Please try again.");
    } finally {
      setIsSemanticLoading(false);
    }
  };

  const resetSemantic = () => {
    setSemanticProducts([]);
    setSemanticQuery("");
    setSemanticError("");
  };

  return (
    <Layout title="Semantic Search">
      <div className="container py-20 mx-auto space-y-4">
        <Card className="mx-2 p-4">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-xl font-semibold">Semantic Search</h2>
              <p className="text-sm text-gray-600">
                Search by meaning, not only keywords. Example: "lightweight laptop for travel".
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                placeholder="Try: noise canceling headphones for flights"
                value={semanticQuery}
                onChange={(e) => setSemanticQuery(e.target.value)}
                className="border p-2 w-full rounded"
              />

              <button
                onClick={handleSemanticSearch}
                disabled={isSemanticLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {isSemanticLoading ? "Searching..." : "Search"}
              </button>

              <button
                onClick={resetSemantic}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Reset
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {semanticPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setSemanticQuery(prompt)}
                  className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:border-blue-600"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {semanticError ? <p className="text-sm text-red-600">{semanticError}</p> : null}
          </div>
        </Card>

        {isSemanticLoading ? (
          <div className="relative h-48">
            <Spinner size={60} loading />
          </div>
        ) : null}

        {!isSemanticLoading && semanticProducts?.length === 0 ? (
          <div className="mx-2 text-sm text-gray-600">
            No semantic results yet. Try a different prompt.
          </div>
        ) : null}

        <Card className="flex flex-wrap h-full mx-2">
          {semanticProducts?.map((prod) => (
            <div
              className="w-full flex flex-col justify-between sm:w-1/2 md:w-1/3 lg:w-1/4 my-2 px-2 box-border"
              key={prod.product_id}
            >
              <Product product={prod} />
            </div>
          ))}
        </Card>
      </div>
    </Layout>
  );
};

export default SemanticSearch;
