
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { JobManager_ABI, JobManager_Address } from '../../../../lib/constants';

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider();
    const contract = new ethers.Contract(JobManager_Address, JobManager_ABI, provider);

    const jobCounter = await contract.s_jobCounter();
    const jobs = [];

    for (let i = 0; i < jobCounter; i++) {
      const job = await contract.s_jobs(i);
      jobs.push(job);
    }

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error('GET /api/jobs/on-chain error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao carregar jobs do smart contract' }, { status: 500 });
  }
}
