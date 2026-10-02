import { db } from '@/lib/db'
import { kbliChecks, negativeNtbChecks } from '@/lib/db/schema'
import { NextResponse } from 'next/server'

export async function GET() {
  const rows = await db
    .select({
      assignmentId: negativeNtbChecks.assignmentId,
      namaPrincipal: negativeNtbChecks.namaPrincipal,
      ntbKbliAkhir: negativeNtbChecks.kbliAkhir,
      ntbKategori: negativeNtbChecks.kategori,
      ntbCatatan: negativeNtbChecks.catatan,
      ntbNilaiTambah: negativeNtbChecks.nilaiTambah,
      kbliId: kbliChecks.id,
      kbliNamaUsaha: kbliChecks.namaUsaha,
      kbliAkhir: kbliChecks.kbliAkhir,
      kbliNamaPrelist: kbliChecks.namaDiPrelist,
      kbliKategori: kbliChecks.kategori,
      kbliStatus: kbliChecks.status,
      kbliKegUtama: kbliChecks.kegUtama,
      kbliLinkFasih: kbliChecks.linkFasih,
    })
    .from(negativeNtbChecks)
    .crossJoin(kbliChecks)
    .limit(1000)

  return NextResponse.json(rows)
}
