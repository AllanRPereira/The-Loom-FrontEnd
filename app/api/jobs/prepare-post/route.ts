
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { JobManager_ABI, JobManager_Address } from '../../../../lib/constants';

export async function POST(request: Request) {
  try {
    const { dataUrl, scriptUrl, usdAmount } = await request.json();

    const provider = new ethers.JsonRpcProvider();
    const contract = new ethers.Contract(JobManager_Address, JobManager_ABI, provider);

    const populatedTx = await contract.postJob.populateTransaction(dataUrl, usdAmount);

    const txDetails = {
      to: JobManager_Address,
      value: populatedTx.value?.toString(),
      data: populatedTx.data,
    };

    return NextResponse.json(txDetails);
  } catch (error: any) {
    console.error('POST /api/jobs/prepare-post error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao preparar a transação do job' }, { status: 500 });
  }
}
