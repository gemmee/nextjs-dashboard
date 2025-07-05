import Pagination from '@/app/ui/invoices/pagination';
import Table from '@/app/ui/customers/table';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchCustomersPages, fetchFilteredCustomers } from '@/app/lib/data';
 
export const metadata: Metadata = {
  title: 'Customers',
};
 
export default async function Page(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = await fetchCustomersPages();
    // console.log(totalPages);
  const customers = await fetchFilteredCustomers(query);

  return (
    <div className="w-full"> 
       <Suspense>
        <Table customers={customers} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}