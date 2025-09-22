"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Transaction = {
  _id: string;
  description: string;
  type: "credit" | "debit";
  amount: number;
  status: string;
  reference_number: string;
  createdAt: string;
};

export default function WalletPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState<boolean>(true);

  // Withdraw modal
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!token || !user) return;

    const fetchWallet = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setBalance(data.balance);
          setTransactions(data.transactions || []);
        } else {
          addToast({
            title: "❌ Error",
            description: data.message || "Failed to load wallet",
          });
        }
      } catch (err) {
        addToast({ title: "❌ Network Error", description: String(err) });
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [token, user, addToast]);

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = transactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle Withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    setWithdrawing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          bankAccount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast({ title: "✅ Success", description: data.message });
        setBalance(data.balance);
        setTransactions((prev) => [data.transaction, ...prev]);
        setWithdrawOpen(false);
        setWithdrawAmount("");
        setBankAccount("");
      } else {
        addToast({ title: "❌ Error", description: data.message });
      }
    } catch (err) {
      addToast({ title: "❌ Network Error", description: String(err) });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Wallet</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin w-5 h-5" /> Loading wallet...
        </div>
      ) : (
        <>
          {/* Balance Card */}
          <Card className="bg-blue-600 text-white shadow-md">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-lg">Available Balance</CardTitle>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-white hover:text-gray-200"
              >
                {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-3xl font-bold">
                {showBalance ? `₦ ${balance.toLocaleString()}` : "••••••"}
              </p>
              <Button
                className="bg-green-500 text-white"
                onClick={() => setWithdrawOpen(true)}
              >
                Withdraw
              </Button>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Transaction History</h2>
            {transactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-100 text-left">
                      <tr>
                        <th className="p-3 border">Date</th>
                        <th className="p-3 border">Description</th>
                        <th className="p-3 border">Reference</th>
                        <th className="p-3 border">Type</th>
                        <th className="p-3 border">Amount</th>
                        <th className="p-3 border">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTransactions.map((tx) => (
                        <tr key={tx._id} className="hover:bg-gray-50">
                          <td className="p-3 border">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3 border">{tx.description}</td>
                          <td className="p-3 border">{tx.reference_number}</td>
                          <td className="p-3 border capitalize">{tx.type}</td>
                          <td
                            className={`p-3 border font-bold ${
                              tx.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {tx.type === "credit" ? "+" : "-"} ₦
                            {tx.amount.toLocaleString()}
                          </td>
                          <td className="p-3 border">{tx.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded ${
                          currentPage === i + 1
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No transactions yet.</p>
            )}
          </div>

          {/* Withdraw Dialog */}
          <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Money</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Amount (₦)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <Input
                  placeholder="Bank Account (Optional)"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-white text-blue-600"
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                >
                  {withdrawing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Withdraw"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
