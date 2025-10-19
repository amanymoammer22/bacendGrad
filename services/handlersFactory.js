const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const document = await Model.findByIdAndDelete(id);

        if (!document) {
            return next(new ApiError(`No document for this id ${id}`, 404));
        }
        res.status(204).send();
    });

    
exports.updateOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const updateData = { ...req.body };
        if (!req.body.imageCover) delete updateData.imageCover;

        const document = await Model.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        });

        if (!document) {
            return next(new ApiError(`No document for this id ${req.params.id}`, 404));
        }
        res.status(200).json({ data: document });
    });

exports.createOne = (Model) =>
    asyncHandler(async (req, res) => {
        const newDoc = await Model.create(req.body);
        res.status(201).json({ data: newDoc });
    });

exports.getOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const document = await Model.findById(id);
        if (!document) {
            return next(new ApiError(`No document for this id ${id}`, 404));
        }
        res.status(200).json({ data: document });
    });


exports.getAll = (Model, modelName = "", populateOptions = []) =>
    asyncHandler(async (req, res) => {
        console.log("🟢 Raw req.query at entry:", req.query);

        let filter = {};
        if (req.filterObj) {
            filter = req.filterObj;
        }

        // Apply base filters and search
        const baseQuery = new ApiFeatures(Model.find(filter), req.query).filter().search(modelName);

        const countConditions = baseQuery.mongooseQuery.getQuery();
        const documentsCounts = await Model.countDocuments(countConditions);

        let query = Model.find(filter);
        if (populateOptions.length > 0) {
            populateOptions.forEach((opt) => {
                query = query.populate(opt);
            });
        }

        const apiFeatures = new ApiFeatures(query, req.query).filter().search(modelName).sort().limitFields().paginate(documentsCounts);

        const { mongooseQuery, paginationResult } = apiFeatures;
        const documents = await mongooseQuery;

        res.status(200).json({
            results: documents.length,
            paginationResult,
            data: documents,
        });
    });
