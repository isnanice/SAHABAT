/**
 * @typedef {'SISWA' | 'GURU_BK' | 'KEPALA_SEKOLAH'} UserRole
 */

/**
 * @typedef {'RENDAH' | 'SEDANG' | 'TINGGI' | 'KRITIS'} PriorityLevel
 */

/**
 * @typedef {'VERBAL' | 'FISIK' | 'SIBER' | 'SOSIAL' | 'SEKSUAL'} BullyingType
 */

/**
 * @typedef {'MENUNGGU' | 'DIPROSES' | 'SELESAI' | 'DITUTUP'} TicketStatus
 */

/**
 * @typedef {'MENUNGGU' | 'DIKONFIRMASI' | 'BERLANGSUNG' | 'SELESAI' | 'DIBATALKAN'} KonselingStatus
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} full_name
 * @property {UserRole} role
 * @property {string} [school_id]
 * @property {string} [kelas]
 * @property {string} [avatar_url]
 * @property {number} [poin]
 * @property {string} created_at
 */

/**
 * @typedef {Object} LaporanBullying
 * @property {string} id
 * @property {string} kode_tiket
 * @property {string} [pelapor_id]
 * @property {string} [korban_id]
 * @property {BullyingType} jenis_bullying
 * @property {string} deskripsi
 * @property {string} [lokasi]
 * @property {string} [tanggal_kejadian]
 * @property {PriorityLevel} prioritas
 * @property {TicketStatus} status
 * @property {boolean} anonim
 * @property {string} [penanganan_guru_id]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ChatbotMessage
 * @property {string} id
 * @property {string} session_id
 * @property {'user' | 'assistant'} role
 * @property {string} content
 * @property {string} created_at
 */

/**
 * @typedef {Object} ForumPost
 * @property {string} id
 * @property {string} [author_id]
 * @property {string} judul
 * @property {string} konten
 * @property {string[]} [tags]
 * @property {boolean} anonim
 * @property {boolean} terverifikasi
 * @property {number} likes
 * @property {string} created_at
 */

/**
 * @typedef {Object} BuddyMatch
 * @property {string} id
 * @property {string} siswa_id
 * @property {string} buddy_id
 * @property {'AKTIF' | 'SELESAI' | 'DITANGGUHKAN'} status
 * @property {string} created_at
 */

/**
 * @typedef {Object} JadwalKonseling
 * @property {string} id
 * @property {string} siswa_id
 * @property {string} guru_bk_id
 * @property {string} tanggal
 * @property {string} waktu_mulai
 * @property {string} waktu_selesai
 * @property {KonselingStatus} status
 * @property {string} [catatan]
 */

/**
 * @typedef {Object} ModulEdukasi
 * @property {string} id
 * @property {string} judul
 * @property {string} deskripsi
 * @property {string} konten_url
 * @property {number} poin_reward
 * @property {'VIDEO' | 'ARTIKEL' | 'QUIZ' | 'INFOGRAFIS'} tipe
 * @property {boolean} aktif
 */

module.exports = {}
