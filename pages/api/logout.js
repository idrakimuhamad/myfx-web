import axios from 'axios'

export default (req, res) => {
  const { session } = req.query

  axios
    .get(`https://www.myfxbook.com/api/logout.json?session=${session}`)
    .then(response => res.status(200).json(response.data))
    .catch(function(error) {
      // handle error
      console.log(error)
    })
}
