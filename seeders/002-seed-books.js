'use strict';

const { Book } = require('../models');

/**
 * Seed books
 */
const seedBooks = async () => {
  try {
    // Check if books already exist
    const existingBooks = await Book.count();
    if (existingBooks > 0) {
      console.log(`⏭️  ${existingBooks} buku sudah ada, skip seeding...`);
      return;
    }

    const books = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0-7432-7356-5',
        description: 'A classic American novel set in the Jazz Age, following the mysterious millionaire Jay Gatsby and his obsession with Daisy Buchanan.',
        price: 75000,
        stock: 50,
        coverImage: 'https://example.com/images/great-gatsby.jpg',
        isActive: true
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0-06-112008-4',
        description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
        price: 65000,
        stock: 30,
        coverImage: 'https://example.com/images/mockingbird.jpg',
        isActive: true
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0-452-28423-4',
        description: 'A dystopian social science fiction novel about totalitarian surveillance and thought control.',
        price: 70000,
        stock: 45,
        coverImage: 'https://example.com/images/1984.jpg',
        isActive: true
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '978-0-14-143951-8',
        description: 'A romantic novel of manners that follows the character development of Elizabeth Bennet.',
        price: 60000,
        stock: 25,
        coverImage: 'https://example.com/images/pride-prejudice.jpg',
        isActive: true
      },
      {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        isbn: '978-0-316-76948-0',
        description: 'A controversial novel about teenage rebellion and alienation in post-World War II America.',
        price: 68000,
        stock: 20,
        coverImage: 'https://example.com/images/catcher-rye.jpg',
        isActive: true
      },
      {
        title: 'Lord of the Flies',
        author: 'William Golding',
        isbn: '978-0-571-05686-5',
        description: 'A story about a group of British boys stranded on an uninhabited island and their disastrous attempt to govern themselves.',
        price: 72000,
        stock: 35,
        coverImage: 'https://example.com/images/lord-flies.jpg',
        isActive: true
      },
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        isbn: '978-0-544-17697-5',
        description: 'A fantasy novel about the adventures of Bilbo Baggins in Middle-earth.',
        price: 85000,
        stock: 60,
        coverImage: 'https://example.com/images/hobbit.jpg',
        isActive: true
      },
      {
        title: 'Animal Farm',
        author: 'George Orwell',
        isbn: '978-0-452-28424-1',
        description: 'An allegorical novella about a group of farm animals who rebel against their human farmer.',
        price: 55000,
        stock: 40,
        coverImage: 'https://example.com/images/animal-farm.jpg',
        isActive: true
      },
      {
        title: 'Brave New World',
        author: 'Aldous Huxley',
        isbn: '978-0-06-085052-4',
        description: 'A dystopian novel set in a futuristic World State where citizens are environmentally engineered.',
        price: 73000,
        stock: 15,
        coverImage: 'https://example.com/images/brave-new-world.jpg',
        isActive: true
      },
      {
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        isbn: '978-0-06-112241-5',
        description: 'A philosophical novel about a young Andalusian shepherd who travels from Spain to Egypt in search of treasure.',
        price: 80000,
        stock: 55,
        coverImage: 'https://example.com/images/alchemist.jpg',
        isActive: true
      }
    ];

    // Create books
    for (const bookData of books) {
      await Book.create(bookData);
    }

    console.log(`✅ ${books.length} buku berhasil dibuat`);
    console.log('   Buku-buku tersedia dengan stock yang berbeda untuk testing');
  } catch (error) {
    console.error('❌ Error saat seeding books:', error);
    throw error;
  }
};

module.exports = seedBooks;

