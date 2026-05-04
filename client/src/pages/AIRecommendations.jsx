import { Card } from "@windmill/react-ui";
import Product from "components/Product";
import Spinner from "components/Spinner";
import Layout from "layout/Layout";
import { useMemo, useState } from "react";
import API from "../api/axios.config";
import toast from "react-hot-toast";

const AI_RECOMMEND_ENDPOINT = "/ai/recommend";

const AIRecommendations = () => {
  const [query, setQuery] = useState("");
  const [aiProducts, setAiProducts] = useState([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");

  const quickPrompts = useMemo(
    () => [
      "laptop under 70000",
      "gaming mouse for fps",
      "office chair ergonomic",
      "wireless earbuds with ANC",
      "smartwatch for fitness",
    ],
    []
  );

  const handleRecommend = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setAiError("Please enter what you are looking for.");
      return;
    }

    try {
      setAiError("");
      setIsAILoading(true);
      const res = await API.post(AI_RECOMMEND_ENDPOINT, { query: trimmed });
      const items = res.data.data || [];
      setAiProducts(items);
      toast.success(`Found ${items.length} recommendations`);

      const summary = items.length
        ? `Here are some AI recommendations for \"${trimmed}\":\n${items
            .slice(0, 6)
            .map((item, index) => `${index + 1}. ${item.name} (Rs.${Number(item.price).toFixed(0)})`)
            .join("\n")}`
        : "No AI recommendations found.";

      window.dispatchEvent(new CustomEvent("ai:recommendations", { detail: { message: summary } }));

      if (sendWhatsApp && whatsAppNumber.trim()) {
        const to = whatsAppNumber.trim();
        if (!to.startsWith("+")) {
          toast.error("WhatsApp number must include country code (e.g., +91xxxxxxxxxx)");
        } else {
          try {
            await API.post("/whatsapp/send", {
              to,
              message: summary,
            });
            toast.success("Sent recommendations to WhatsApp");
          } catch (err) {
            console.error(err);
            const apiError = err?.response?.data;
            const detail = apiError?.error ? ` (${apiError.error})` : "";
            toast.error(`WhatsApp send failed. Please check the number and try again.${detail}`);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setAiError("We could not fetch recommendations. Please try again.");
      toast.error("Failed to fetch recommendations");
    } finally {
      setIsAILoading(false);
    }
  };

  const resetAi = () => {
    setAiProducts([]);
    setQuery("");
    setAiError("");
  };

  return (
    <Layout title="AI Recommendations">
      <div className="container py-20 mx-auto space-y-4">
        <Card className="mx-2 p-4">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-xl font-semibold">AI Recommendations</h2>
              <p className="text-sm text-gray-600">
                Describe what you want and we will recommend the best products for you.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                placeholder="Try: laptop under 70000 or ergonomic office chair"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border p-2 w-full rounded"
              />

              <button
                onClick={handleRecommend}
                disabled={isAILoading}
                className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {isAILoading ? "Finding..." : "Recommend"}
              </button>

              <button
                onClick={resetAi}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Reset
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                />
                Send to WhatsApp
              </label>
              {sendWhatsApp ? (
                <input
                  type="text"
                  placeholder="WhatsApp number e.g. +918660122881"
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumber(e.target.value)}
                  className="border p-2 rounded w-full sm:w-64"
                />
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setQuery(prompt)}
                  className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:border-purple-600"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {aiError ? <p className="text-sm text-red-600">{aiError}</p> : null}
          </div>
        </Card>

        {isAILoading ? (
          <div className="relative h-48">
            <Spinner size={60} loading />
          </div>
        ) : null}

        {!isAILoading && aiProducts?.length === 0 ? (
          <div className="mx-2 text-sm text-gray-600">
            No AI recommendations yet. Try a different prompt.
          </div>
        ) : null}

        <Card className="flex flex-wrap h-full mx-2">
          {aiProducts?.map((prod) => (
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

export default AIRecommendations;
