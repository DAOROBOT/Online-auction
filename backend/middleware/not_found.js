export default function not_found (req, res, next){
    res.status(404).json({
        message: "Not found",
    });
}