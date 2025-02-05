import { expect } from 'chai';
import sinon from 'sinon';
import { TMDBService } from '../../services/tmdb/tmdb.service';
import { TMDBApiClient } from '../../services/tmdb/tmdb-api.client';
import { MovieListResponse, MovieDetails } from '../../services/tmdb/types/responses';

describe('TMDB 服務', () => {
  let tmdbService: TMDBService;
  let sandbox: sinon.SinonSandbox;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    tmdbService = new TMDBService(mockApiKey);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getPopularMovies()', () => {
    it('應成功獲取熱門電影列表', async () => {
      const mockResponse: MovieListResponse = {
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

      const getStub = sandbox.stub(TMDBApiClient.prototype, 'get')
        .resolves(mockResponse);

      const result = await tmdbService.getPopularMovies({ page: 1 });

      expect(result.success).to.be.true;
      expect(result.data).to.deep.equal(mockResponse);
      expect(getStub.calledWith('/movie/popular', { page: 1 })).to.be.true;
    });

    it('應正確處理API錯誤', async () => {
      const error = new Error('API錯誤');
      sandbox.stub(TMDBApiClient.prototype, 'get').rejects(error);

      try {
        await tmdbService.getPopularMovies({ page: 1 });
        expect.fail('應該拋出錯誤');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });

  describe('getMovieDetails()', () => {
    it('應成功獲取電影詳情', async () => {
      const mockResponse: MovieDetails = {
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

      const getStub = sandbox.stub(TMDBApiClient.prototype, 'get')
        .resolves(mockResponse);

      const result = await tmdbService.getMovieDetails({ id: 1 });

      expect(result.success).to.be.true;
      expect(result.data).to.deep.equal(mockResponse);
      expect(getStub.calledWith('/movie/1')).to.be.true;
    });

    it('應正確處理不存在的電影ID', async () => {
      const error = new Error('找不到電影');
      sandbox.stub(TMDBApiClient.prototype, 'get').rejects(error);

      try {
        await tmdbService.getMovieDetails({ id: 999999 });
        expect.fail('應該拋出錯誤');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });

  describe('searchMovies()', () => {
    it('應成功搜索電影', async () => {
      const mockResponse: MovieListResponse = {
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

      const getStub = sandbox.stub(TMDBApiClient.prototype, 'get')
        .resolves(mockResponse);

      const result = await tmdbService.searchMovies({ 
        query: '測試',
        page: 1 
      });

      expect(result.success).to.be.true;
      expect(result.data).to.deep.equal(mockResponse);
      expect(getStub.calledWith('/search/movie', {
        query: '測試',
        page: 1
      })).to.be.true;
    });

    it('應正確處理空搜索結果', async () => {
      const mockResponse: MovieListResponse = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      };

      const getStub = sandbox.stub(TMDBApiClient.prototype, 'get')
        .resolves(mockResponse);

      const result = await tmdbService.searchMovies({ 
        query: '不存在的電影',
        page: 1 
      });

      expect(result.success).to.be.true;
      expect(result.data.results).to.be.empty;
      expect(getStub.calledOnce).to.be.true;
    });
  });

  describe('buildImageUrl()', () => {
    it('應正確構建圖片URL', () => {
      const path = '/test.jpg';
      const result = TMDBService.buildImageUrl(path);
      expect(result).to.equal('https://image.tmdb.org/t/p/w500/test.jpg');
    });

    it('當路徑為null時應返回null', () => {
      const result = TMDBService.buildImageUrl(null);
      expect(result).to.be.null;
    });

    it('應支持不同的圖片尺寸', () => {
      const path = '/test.jpg';
      const result = TMDBService.buildImageUrl(path, 'original');
      expect(result).to.equal('https://image.tmdb.org/t/p/original/test.jpg');
    });
  });
});