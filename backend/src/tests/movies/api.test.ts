import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import express from 'express';
import { TMDBService } from '../../services/tmdb/tmdb.service';
import movieRoutes from '../../routes/movie.routes';
import { MovieListResponse, MovieDetails } from '../../services/tmdb/types/responses';

describe('電影 API', () => {
  let app: express.Application;
  let sandbox: sinon.SinonSandbox;
  let tmdbService: TMDBService;

  before(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/movies', movieRoutes);
    // 使用全局錯誤處理中間件
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message
        }
      });
    });
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    tmdbService = new TMDBService('test-api-key');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('GET /api/v1/movies/popular', () => {
    const mockMovieList: MovieListResponse = {
      page: 1,
      results: [{
        id: 1,
        title: '測試電影',
        original_title: 'Test Movie',
        overview: '這是一部測試電影',
        poster_path: '/test.jpg',
        backdrop_path: '/test-backdrop.jpg',
        release_date: '2024-02-04',
        vote_average: 8.5,
        vote_count: 100,
        genre_ids: [28, 12]
      }],
      total_pages: 10,
      total_results: 100
    };

    it('應成功返回熱門電影列表', async () => {
      sandbox.stub(TMDBService.prototype, 'getPopularMovies').resolves({
        success: true,
        data: mockMovieList
      });

      const response = await request(app)
        .get('/api/v1/movies/popular')
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data).to.deep.equal(mockMovieList);
    });

    it('應處理無效的頁碼參數', async () => {
      const response = await request(app)
        .get('/api/v1/movies/popular?page=invalid')
        .expect(400);

      expect(response.body.status).to.equal('error');
      expect(response.body.error.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/movies/:id', () => {
    const mockMovieDetail: MovieDetails = {
      id: 1,
      title: '測試電影',
      original_title: 'Test Movie',
      overview: '這是一部測試電影',
      poster_path: '/test.jpg',
      backdrop_path: '/test-backdrop.jpg',
      release_date: '2024-02-04',
      vote_average: 8.5,
      vote_count: 100,
      runtime: 120,
      genres: [{ id: 28, name: '動作' }]
    };

    it('應成功返回電影詳情', async () => {
      sandbox.stub(TMDBService.prototype, 'getMovieDetails').resolves({
        success: true,
        data: mockMovieDetail
      });

      const response = await request(app)
        .get('/api/v1/movies/1')
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data).to.deep.equal(mockMovieDetail);
    });

    it('應處理無效的電影ID', async () => {
      const response = await request(app)
        .get('/api/v1/movies/invalid')
        .expect(400);

      expect(response.body.status).to.equal('error');
      expect(response.body.error.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/movies/search', () => {
    const mockSearchResult: MovieListResponse = {
      page: 1,
      results: [{
        id: 1,
        title: '測試電影',
        original_title: 'Test Movie',
        overview: '這是一部測試電影',
        poster_path: '/test.jpg',
        backdrop_path: '/test-backdrop.jpg',
        release_date: '2024-02-04',
        vote_average: 8.5,
        vote_count: 100,
        genre_ids: [28, 12]
      }],
      total_pages: 1,
      total_results: 1
    };

    it('應成功返回搜索結果', async () => {
      sandbox.stub(TMDBService.prototype, 'searchMovies').resolves({
        success: true,
        data: mockSearchResult
      });

      const response = await request(app)
        .get('/api/v1/movies/search?query=test')
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data).to.deep.equal(mockSearchResult);
    });

    it('應處理缺少查詢參數', async () => {
      const response = await request(app)
        .get('/api/v1/movies/search')
        .expect(400);

      expect(response.body.status).to.equal('error');
      expect(response.body.error.code).to.equal('VALIDATION_ERROR');
    });

    it('應處理無效的頁碼參數', async () => {
      const response = await request(app)
        .get('/api/v1/movies/search?query=test&page=invalid')
        .expect(400);

      expect(response.body.status).to.equal('error');
      expect(response.body.error.code).to.equal('VALIDATION_ERROR');
    });
  });
});