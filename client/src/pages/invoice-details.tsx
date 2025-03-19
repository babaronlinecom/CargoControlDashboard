import React from 'react';
import { useParams } from 'wouter';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { InvoiceView } from '@/components/invoices/invoice-view';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function InvoiceDetails() {
  const params = useParams();
  // Get the invoice ID from the URL params
  const invoiceId = params.id ? parseInt(params.id) : 0;

  if (!invoiceId) {
    return (
      <DashboardLayout title="Invoice Details">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-lg text-gray-500 mb-4">Invalid invoice ID</p>
              <Link href="/invoices">
                <Button variant="outline" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Invoices
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Invoice Details">
      <div className="flex justify-between items-center mb-6">
        <Link href="/invoices">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </Link>
      </div>
      
      <InvoiceView invoiceId={invoiceId} />
    </DashboardLayout>
  );
}