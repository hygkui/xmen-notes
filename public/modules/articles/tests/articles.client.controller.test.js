'use strict';

(function() {
	// Articles Controller Spec
	describe('ArticlesController', function() {
		// Initialize global variables
		var ArticlesController,
			scope,
			$httpBackend,
			$stateParams,
			$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// [jasmine] Matcher Factories:
		// Custom matcher factories are passed two parameters: 
		// 1.util, which has a set of utility functions for matchers to use (see: matchersUtil.js for the current list)
		// 2.customEqualityTesters which needs to be passed in if util.equals is ever called. 
		// These parameters are available for use when then matcher is called.

		// The factory method should return an object with a compare function 
		// that will be called to check the expectation. return {compare: function (actual, expected) {}}

		// compare 返回的result must return a result object with a pass property {pass:true/false, message:''} message 是可选的。 
		// that is a boolean result of the matcher. The pass property tells 
		// the expectation whether the matcher was successful (true) or unsuccessful (false). 
		// If the expectation is called/chained with .not, the expectation will negate this to determine whether the expectation is met.



		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Articles controller.
			ArticlesController = $controller('ArticlesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one article object fetched from XHR', inject(function(Articles) {
			// Create sample article using the Articles service
			var sampleArticle = new Articles({
				title: 'An Article about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample articles array that includes the new article
			var sampleArticles = [sampleArticle];

			// Set GET response，模拟后端返回GET的数据。
			$httpBackend.expectGET('articles').respond(sampleArticles);

			// Run controller functionality
			scope.find();  // 执行控制器函数
			$httpBackend.flush(); // 返回模拟的数据

			// Test scope value  // expect 测试
			expect(scope.articles).toEqualData(sampleArticles);
		}));

		it('$scope.findOne() should create an array with one article object fetched from XHR using a articleId URL parameter', inject(function(Articles) {
			// Define a sample article object
			var sampleArticle = new Articles({
				title: 'An Article about MEAN',
				content: 'MEAN rocks!'
			});

			// Set the URL parameter
			$stateParams.articleId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/articles\/([0-9a-fA-F]{24})$/).respond(sampleArticle);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.article).toEqualData(sampleArticle);
		}));

		it('$scope.create() with valid form data should send a POST 
			request with the form input values and then 
			locate to new object URL', inject(function(Articles) {
			// Create a sample article object
			var sampleArticlePostData = new Articles({
				title: 'An Article about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample article response
			var sampleArticleResponse = new Articles({
				_id: '525cf20451979dea2c000001',
				title: 'An Article about MEAN',
				content: 'MEAN rocks!'
			});

			// Fixture mock form input values
			scope.title = 'An Article about MEAN';
			scope.content = 'MEAN rocks!';

			// Set POST response
			$httpBackend.expectPOST('articles', sampleArticlePostData).respond(sampleArticleResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.title).toEqual('');
			expect(scope.content).toEqual('');

			// Test URL redirection after the article was created
			expect($location.path()).toBe('/articles/' + sampleArticleResponse._id);
		}));

		it('$scope.update() should update a valid article', inject(function(Articles) {
			// Define a sample article put data
			var sampleArticlePutData = new Articles({
				_id: '525cf20451979dea2c000001',
				title: 'An Article about MEAN',
				content: 'MEAN Rocks!'
			});

			// Mock article in scope
			scope.article = sampleArticlePutData;

			// Set PUT response
			$httpBackend.expectPUT(/articles\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/articles/' + sampleArticlePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid articleId 
			and remove the article from the scope', inject(function(Articles) {
			// Create new article object
			var sampleArticle = new Articles({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new articles array and include the article
			scope.articles = [sampleArticle];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/articles\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleArticle);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.articles.length).toBe(0);
		}));
	});
}());
