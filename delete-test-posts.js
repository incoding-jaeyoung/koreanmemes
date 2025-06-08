const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteTestPosts() {
  try {
    console.log('🔍 현재 게시물 확인 중...')
    
    // 모든 게시물 조회
    const allPosts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 총 ${allPosts.length}개의 게시물이 있습니다:`)
    allPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} (댓글: ${post._count.comments}개, 작성일: ${post.createdAt.toLocaleDateString()})`)
    })
    
    console.log('\n⚠️  모든 게시물과 관련 댓글을 삭제하시겠습니까?')
    console.log('삭제를 원하시면 아래 명령어를 실행하세요:')
    console.log('node delete-test-posts.js --confirm')
    
    // --confirm 플래그가 있으면 실제 삭제 실행
    if (process.argv.includes('--confirm')) {
      console.log('\n🗑️  삭제를 시작합니다...')
      
      // 1. 먼저 모든 댓글 삭제
      const deletedComments = await prisma.comment.deleteMany({})
      console.log(`✅ ${deletedComments.count}개의 댓글이 삭제되었습니다.`)
      
      // 2. 모든 게시물 삭제
      const deletedPosts = await prisma.post.deleteMany({})
      console.log(`✅ ${deletedPosts.count}개의 게시물이 삭제되었습니다.`)
      
      console.log('\n🎉 모든 테스트 데이터가 성공적으로 삭제되었습니다!')
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteTestPosts() 