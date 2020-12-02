const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

// CONFIG
const dbUrl = 'mongodb://localhost/blog_app';
const dbOptions = {
    keepAlive: 1,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
};

mongoose.connect(dbUrl, dbOptions).then(() => console.log('Connected to database...'));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('port', process.env.PORT || 3000);
app.use(methodOverride('_method'));
app.use(expressSanitizer());

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model('Blog', blogSchema);

// ROUTES
app.get('/', (req, res) => res.redirect('/blogs'));

app.get('/blogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            console.log(err)
        } else {
            res.render('index', {blogs: blogs});
        }
    })
});

app.get('/blogs/new', (req, res) => res.render('new'));

app.post('/blogs', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err, newBlog) => {
        if (err) {
            res.render('new');
        }
        else {
            res.redirect('/blogs');
        }
    });
});

app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, blog) => {
        if (err) {
            res.redirect('/blogs');
        }
        else {
            res.render('show', {blog: blog});
        }
    });
});

app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, blog) => {
        if (err) {
            res.redirect('/blogs');
        }
        else {
            res.render('edit', {blog: blog});
        }
    });
});

app.put('/blogs/:id', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if (err) {
            res.redirect('/blogs');
        }
        else {
            res.redirect('/blogs/' + req.params.id);
        }
    });
});

app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect('/blogs');
        }
        else {
            res.redirect('/blogs');
        }
    });
});

app.listen(app.get('port'), process.env.IP, () => console.log(`Server running in port ${app.get('port')}`));
